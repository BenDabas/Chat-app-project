const users = [];

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase(); // trim()-> removes spaces
    room = room.trim().toLowerCase();

    //Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room required!',
        };
    }

    //Check for existing user
    const existUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    //Validate username
    if (existUser) {
        return {
            error: 'Username is in use!',
        };
    }
    //Store user
    const user = { id, username, room };

    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0]; // Splice removes the individual index and returns array of the removes users
    }
};

const getUser = (id) => {
    return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};
