require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const RunEvent = require('../models/RunEvent');
const Chat = require('../models/Chat');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/runmate', {});
        console.log('MongoDB ansluten för seedning...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        await connectDB();

        console.log('Rensar befintlig data...');
        await User.deleteMany({});
        await RunEvent.deleteMany({});
        await Chat.deleteMany({});

        console.log('Skapar användare...');
        const users = await User.create([
            {
                email: 'test@test.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'other',
                bio: 'Huvudtestanvändare för RunMate.',
                profilePhoto: 'https://i.pravatar.cc/150?u=test@test.com',
                activityLevel: 'recreational',
                sportTypes: ['running'],
            },
            {
                email: 'anna@test.com',
                password: 'password123',
                firstName: 'Anna',
                lastName: 'Pro',
                dateOfBirth: new Date('1992-05-15'),
                gender: 'female',
                bio: 'Professionell löpare som älskar långdistans.',
                profilePhoto: 'https://i.pravatar.cc/150?u=anna@test.com',
                activityLevel: 'competitive',
                sportTypes: ['running'],
            },
            {
                email: 'erik@test.com',
                password: 'password123',
                firstName: 'Erik',
                lastName: 'Snabbfot',
                dateOfBirth: new Date('1995-08-20'),
                gender: 'male',
                bio: 'Sprintspecialist. Snabba pass är min grej!',
                profilePhoto: 'https://i.pravatar.cc/150?u=erik@test.com',
                activityLevel: 'serious',
                sportTypes: ['running'],
            },
            {
                email: 'sofia@test.com',
                password: 'password123',
                firstName: 'Sofia',
                lastName: 'Trail',
                dateOfBirth: new Date('1998-11-30'),
                gender: 'female',
                bio: 'Älskar att springa i skogen och på stigar.',
                profilePhoto: 'https://i.pravatar.cc/150?u=sofia@test.com',
                activityLevel: 'recreational',
                sportTypes: ['running'],
            },
        ]);

        const [mainUser, anna, erik, sofia] = users;
        console.log(`${users.length} användare skapade.`);

        console.log('Skapar löpevent...');
        const runEvents = await RunEvent.create([
            {
                host: anna._id,
                title: 'Morgonjogg i Hagaparken',
                description: 'En lugn morgonjogg för att starta dagen. Vi springer runt Brunnsviken i ett soft tempo. Alla är välkomna!',
                location: { 
                    name: 'Hagaparken, Solna',
                    point: { type: 'Point', coordinates: [18.049, 59.361] }
                },
                distance: 7,
                pace: 360, // 6:00 min/km
                date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                maxParticipants: 10,
                participants: [mainUser._id, erik._id], // host läggs till automatiskt
            },
            {
                host: erik._id,
                title: 'Intervaller på Stadion',
                description: 'Högintensiva intervaller för att boosta flåset. Vi kör 4x4 minuter med 2 minuters vila.',
                location: {
                    name: 'Stockholms Stadion',
                    point: { type: 'Point', coordinates: [18.079, 59.345] }
                },
                distance: 5,
                pace: 270, // 4:30 min/km
                date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                maxParticipants: 8,
                pendingRequests: [sofia._id],
            },
            {
                host: sofia._id,
                title: 'Långpass Söder Mälarstrand',
                description: 'Ett härligt långpass med vacker utsikt över Riddarfjärden.',
                location: {
                    name: 'Söder Mälarstrand, Stockholm',
                    point: { type: 'Point', coordinates: [18.055, 59.320] }
                },
                distance: 15,
                pace: 345, // 5:45 min/km
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                maxParticipants: 12,
            },
        ]);
        console.log(`${runEvents.length} löpevent skapade.`);

        console.log('Skapar test-chattar...');
        const groupChat = await Chat.create({
            participants: [anna._id, mainUser._id, erik._id],
            chatType: 'group',
            name: 'Löpgrupp: Morgonjogg i Hagaparken',
            runEventId: runEvents[0]._id,
            messages: [
                { sender: anna._id, content: 'Hej allihopa! Tagga för löpning på onsdag! 👋' },
                { sender: erik._id, content: 'Absolut! Ska bli kul!' },
                { sender: mainUser._id, content: 'Jag är också med! Ses då!' },
            ]
        });
        
        runEvents[0].chatId = groupChat._id;
        await runEvents[0].save();

        const directChat = await Chat.create({
            participants: [mainUser._id, anna._id],
            chatType: 'direct',
            messages: [
                { sender: anna._id, content: 'Tja! Såg att du också gillar att springa långpass. Ska vi köra ett ihop någon dag?' },
                { sender: mainUser._id, content: 'Javisst, låter kul! När passar det för dig?' },
            ]
        });

        console.log('2 test-chattar skapade.');
        
        console.log('Seedning klar!');

    } catch (error) {
        console.error('Fel vid seedning:', error);
    } finally {
        mongoose.disconnect();
        console.log('MongoDB frånkopplad.');
    }
};

seedData(); 