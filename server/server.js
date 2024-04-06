const mongoose = require('mongoose');
const uri = "mongodb+srv://DilrajR:Dilraj24.@unifynd.zrb98i7.mongodb.net/?retryWrites=true&w=majority&appName=Unifynd";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const postSchema = new mongoose.Schema({
    userName: String,
    title: String,
    content: String,
    city: String,
    price: Number,
    category: String,
    pictureURL: String
});
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    isAdmin: { type: Boolean, default: false }
});
const messageSchema = new mongoose.Schema({
    userName: String,
    receiverName: String,
    message: String,
    date: Date
});
const Post = mongoose.model('Post', postSchema);
const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3001;
const bcrypt = require('bcrypt');

app.use(session({
    secret: 'session-secret-12345@',
    resave: false,
    saveUninitialized: false
}));
app.use(express.json());
app.use(cors());


mongoose.connection.on('error', err => {
    console.log('MongoDB connection error:', err);
});

const salt = 10;
let userId = null;
let messageUser = null;


app.get('/Sale', async (req, res) => {
    try {
        const posts = await Post.find({});
        res.json(posts);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/Profile', async (req, res) => {
    try {
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const posts = await Post.find({ userName: userId });
        res.json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// WITH MongoDB
app.post('/posts', async (req, res) => {
    const { title, content, city, price, pictureURL, category } = req.body;
    if (!title || !content || !pictureURL || !price || !category || !city) {
        return res.status(400).json({ error: 'Title, content, and picture URL are required' });
    }
    try {
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const newPost = new Post({ userName: userId, title, city, content, price, pictureURL, category });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error saving post to MongoDB:', error);
        res.status(500).json({ error: 'Failed to save post' });
    }
});

app.post('/Users', async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, } = req.body;
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ error: 'First name, Last name, Username, email, and password are required' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const emailFormat = /^[a-zA-Z0-9_.+-]+@torontomu.ca/;
        if (!(email.match(emailFormat))) {
            return res.status(400).json({ error: 'Email needs to be @torontomu.ca' });
        }
        const passwordFormat = /^(?=.*\d)(?=.*[@#\-_$%^&+=ยง!\?])(?=.*[a-z])(?=.*[A-Z])[0-9A-Za-z@#\-_$%^&+=ยง!\?]+$/;
        if (!(password.match(passwordFormat))) {
            return res.status(400).json({ error: 'Password, needs 1 cap, 1 lower, 1 number, and 1 ascii' });
        }
        const hashedPassword = await bcrypt.hash(password, salt);
        //Create a new user object with the hash string
        console.log(hashedPassword);

        const newUser = new User({ firstName, lastName, username, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username) {
            return res.status(400).json({ error: 'Username already exists' });
        } else if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
            return res.status(400).json({ error: 'Email already exists' });
        } else {
            console.error('Error creating user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    }
});

app.get('/Users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/Admins', async (req, res) => {
    try {
        const admins = await User.find({ isAdmin: true });
        const responseData = { admins, username: userId };
        res.json(responseData);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(400).json({ error: 'Invalid username or password' });
            }
            req.session.userId = user.username;
            userId = user.username;
            res.status(200).json({ message: 'Authentication successful', user: user, userId: user.username });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/posts/:id', async (req, res) => {
    const postId = req.params.id;
    try {
        const deletedPost = await Post.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

app.delete('/Users/:id', async (req, res) => {
    const userName = req.params.id;
    const deleteuser = await User.findOne({ username: userName })
    if (!deleteuser) {
        return res.status(404).json({ error: 'User not found' });
    }
    const deleteID = deleteuser._id;
    try {
        const deletedUser = await User.findByIdAndDelete(deleteID);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.post('/message', async (req, res) => {
    const { postID } = req.body;
    try {
        const posts = await Post.find({ _id: postID });
        if (posts.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        messageUser = posts[0].userName;
        if (userId === messageUser) {
            return res.status(400).json({ error: 'Cannot message yourself' });
        }
    } catch (err) {
        res.status(500).send(err);
    }
    res.json({ message: 'Message sent' });
});

app.get('/message', async (req, res) => {
    try {
        const messages = await Message.find({ $or: [{ userName: userId, receiverName: messageUser }, { userName: messageUser, receiverName: userId }] });
        const responseData = { messages, userName: userId, receiverName: messageUser };
        res.json(responseData);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/setUser', async (req, res) => {
    const sender = req.body.userId;
    const receiver = req.body.receiverId;
    if (sender === userId) {
        messageUser = receiver;
    } else {
        messageUser = sender;
    }
    res.json({ message: 'User set' });
});

app.get('/inbox', async (req, res) => {
    try {
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { userName: userId },
                        { receiverName: userId }
                    ]
                }
            },
            { $sort: { date: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$userName', userId] },
                            '$receiverName',
                            '$userName'
                        ]
                    },
                    message: { $first: '$message' },
                    userName: { $first: '$userName' },
                    receiverName: { $first: '$receiverName' },
                    date: { $first: '$date' }
                }
            }
        ]);

        res.json(messages);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.post('/sendMessage', async (req, res) => {
    const messageText = req.body.message;
    try {
        const sender = userId;
        const receiver = messageUser;
        if (!sender || !receiver) {
            return res.status(404).json({ error: 'Sender or receiver not found' });
        }

        const newMessage = new Message({
            userName: sender,
            receiverName: receiver,
            message: messageText,
            date: Date.now()
        });

        await newMessage.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});