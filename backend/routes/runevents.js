const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const RunEvent = require('../models/RunEvent');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Create a new run event
// @route   POST /api/runevents
// @access  Private
router.post('/', protect, async (req, res) => {
    const { title, description, location, distance, pace, date, maxParticipants } = req.body;

    if (!title || !description || !location || !distance || !pace || !date) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    try {
        const runEvent = await RunEvent.create({
            host: req.user.id,
            title,
            description,
            location,
            distance,
            pace,
            date,
            maxParticipants
        });

        res.status(201).json({ success: true, data: runEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Get all run events (for discovery)
// @route   GET /api/runevents
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const runEvents = await RunEvent.find({ 
            date: { $gte: new Date() }, // Only future events
            status: 'open' 
        }).populate('host', 'firstName lastName profilePhoto');

        res.status(200).json({ success: true, data: runEvents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Get a single run event
// @route   GET /api/runevents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const runEvent = await RunEvent.findById(req.params.id)
            .populate('host', 'firstName lastName profilePhoto email')
            .populate('participants', 'firstName lastName profilePhoto email')
            .populate('pendingRequests', 'firstName lastName profilePhoto');

        if (!runEvent) {
            return res.status(404).json({ success: false, message: 'Run event not found' });
        }

        res.status(200).json({ success: true, data: runEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Update a run event
// @route   PUT /api/runevents/:id
// @access  Private (Host only)
router.put('/:id', protect, async (req, res) => {
    try {
        let runEvent = await RunEvent.findById(req.params.id);

        if (!runEvent) {
            return res.status(404).json({ success: false, message: 'Run event not found' });
        }

        // Check if user is the host
        if (runEvent.host.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authorized to update this event' });
        }

        runEvent = await RunEvent.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: runEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Cancel a run event
// @route   DELETE /api/runevents/:id
// @access  Private (Host only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const runEvent = await RunEvent.findById(req.params.id);

        if (!runEvent) {
            return res.status(404).json({ success: false, message: 'Run event not found' });
        }

        if (runEvent.host.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authorized to cancel this event' });
        }

        runEvent.status = 'cancelled';
        await runEvent.save();

        res.status(200).json({ success: true, message: 'Run event has been cancelled.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Request to join a run event
// @route   POST /api/runevents/:id/join
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
    try {
        const runEvent = await RunEvent.findById(req.params.id);

        if (!runEvent) {
            return res.status(404).json({ success: false, message: 'Run event not found' });
        }
        if (runEvent.status !== 'open') {
             return res.status(400).json({ success: false, message: 'This run is no longer open for requests.' });
        }
        if (runEvent.host.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot join your own event.' });
        }
        if (runEvent.participants.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'You are already part of this event.' });
        }
        if (runEvent.pendingRequests.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'You have already sent a request to join.' });
        }

        runEvent.pendingRequests.push(req.user.id);
        await runEvent.save();

        res.status(200).json({ success: true, message: 'Your request to join has been sent.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Host manages a join request
// @route   PUT /api/runevents/:id/requests
// @access  Private (Host only)
router.put('/:id/requests', protect, async (req, res) => {
    const { applicantId, action } = req.body; // action: 'approve' or 'reject'

    if (!applicantId || !action) {
        return res.status(400).json({ success: false, message: 'Please provide applicantId and action.' });
    }

    try {
        const runEvent = await RunEvent.findById(req.params.id);

        if (!runEvent) {
            return res.status(404).json({ success: false, message: 'Run event not found' });
        }
        if (runEvent.host.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }
        
        // Remove from pending requests
        const requestIndex = runEvent.pendingRequests.indexOf(applicantId);
        if (requestIndex === -1) {
            return res.status(404).json({ success: false, message: 'Applicant not found in pending requests' });
        }
        runEvent.pendingRequests.splice(requestIndex, 1);

        if (action === 'approve') {
            if (runEvent.participants.length >= runEvent.maxParticipants) {
                return res.status(400).json({ success: false, message: 'Event is already full.' });
            }
            runEvent.participants.push(applicantId);

            if (runEvent.participants.length === runEvent.maxParticipants) {
                runEvent.status = 'full';
            }
            
            // Create a chat group when the first participant is approved.
            if (!runEvent.chatId) {
                const newChat = await Chat.create({
                    name: runEvent.title,
                    chatType: 'group',
                    participants: [runEvent.host, applicantId]
                });
                runEvent.chatId = newChat._id;
            } else {
                // If chat already exists, just add the new participant
                await Chat.findByIdAndUpdate(runEvent.chatId, {
                    $addToSet: { participants: applicantId }
                });
            }
        }
        
        await runEvent.save();
        const updatedEvent = await RunEvent.findById(req.params.id)
            .populate('host', 'firstName lastName profilePhoto email')
            .populate('participants', 'firstName lastName profilePhoto')
            .populate('pendingRequests', 'firstName lastName profilePhoto');

        res.status(200).json({ success: true, message: `Request has been ${action}ed.`, data: updatedEvent });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Participant leaves a run event
// @route   POST /api/runevents/:id/leave
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
    try {
        const runEvent = await RunEvent.findById(req.params.id);

        if (!runEvent) {
            return res.status(404).json({ success: false, message: 'Run event not found' });
        }
        if (runEvent.host.toString() === req.user.id) {
            return res.status(400).json({ success: false, message: 'Host cannot leave the event, you must cancel it.' });
        }

        const participantIndex = runEvent.participants.map(p => p.toString()).indexOf(req.user.id);
        if (participantIndex === -1) {
            return res.status(400).json({ success: false, message: 'You are not a participant in this event.' });
        }

        runEvent.participants.splice(participantIndex, 1);

        if (runEvent.status === 'full') {
            runEvent.status = 'open';
        }

        // Remove participant from the chat if it exists
        if (runEvent.chatId) {
            await Chat.findByIdAndUpdate(runEvent.chatId, {
                $pull: { participants: req.user.id }
            });
        }

        await runEvent.save();
        res.status(200).json({ success: true, message: 'You have left the event.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


module.exports = router; 