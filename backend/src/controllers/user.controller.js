import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import { upsertStreamUser } from "../lib/stream.js";

export async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic } = req.body;

        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName.trim();
        if (bio !== undefined) updateData.bio = bio;
        if (nativeLanguage !== undefined) updateData.nativeLanguage = nativeLanguage;
        if (learningLanguage !== undefined) updateData.learningLanguage = learningLanguage;
        if (location !== undefined) updateData.location = location;
        if (profilePic !== undefined) updateData.profilePic = profilePic;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePic || "",
            });
        } catch (streamErr) {
            console.log("Error syncing updated user to Stream:", streamErr.message);
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function rejectFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Verify the current user is the recipient
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to decline this request" });
        }

        await FriendRequest.findByIdAndDelete(requestId);

        res.status(200).json({ success: true, message: "Friend request declined" });
    } catch (error) {
        console.error("Error in rejectFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function cancelFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const { id: targetId } = req.params;

        // targetId can be the requestId or the recipientId
        const query = {
            $or: [
                { _id: targetId, sender: myId, status: "pending" },
                { recipient: targetId, sender: myId, status: "pending" }
            ]
        };

        const deletedRequest = await FriendRequest.findOneAndDelete(query);
        if (!deletedRequest) {
            return res.status(404).json({ message: "Pending friend request not found" });
        }

        res.status(200).json({ success: true, message: "Friend request cancelled" });
    } catch (error) {
        console.error("Error in cancelFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function unfriendUser(req, res) {
    try {
        const myId = req.user.id;
        const { id: friendId } = req.params;

        await User.findByIdAndUpdate(myId, {
            $pull: { friends: friendId },
        });

        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: myId },
        });

        // Clean up any friend request records between them
        await FriendRequest.deleteMany({
            $or: [
                { sender: myId, recipient: friendId },
                { sender: friendId, recipient: myId },
            ]
        });

        res.status(200).json({ success: true, message: "User unfriended successfully" });
    } catch (error) {
        console.error("Error in unfriendUser controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, //exclude current user
                { _id: { $nin: currentUser.friends } },
                { isOnboarded: true }
            ]
        })
        res.status(200).json(recommendedUsers)
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
            .select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const { id: recipientId } = req.params;

        // prevent sending req to yourself
        if (myId === recipientId) {
            return res.status(400).json({ message: "You can't send friend request to yourself" });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        // check if user is already friends
        if (recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }

        // check if a request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId },
            ],
        });

        if (existingRequest) {
            return res
                .status(400)
                .json({ message: "A friend request already exists between you and this user" });
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);

    } catch (error) {
        console.error("Error in sendFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // Verify the current user is the recipient
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this request" });
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        // add each user to the other's friends array
        // $addToSet: adds elements to an array only if they do not already exist.
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient },
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender },
        });

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.log("Error in acceptFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status: "accepted",
        }).populate("recipient", "fullName profilePic");

        res.status(200).json({ incomingReqs, acceptedReqs });
    } catch (error) {
        console.log("Error in getPendingFriendRequests controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getOutgoingFriendReqs(req, res) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending",
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.log("Error in getOutgoingFriendReqs controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUserById controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}