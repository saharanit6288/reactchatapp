import React from 'react';
import MessageList from './MessageList';
import SendMessage from './SendMessage';
import { ChatManager, TokenProvider } from '@pusher/chatkit-client';

class ChatApp extends React.Component {
    constructor(props) {
        super(props); 
        this.state = {
            currentUser: null,
            currentRoom: {users:[]},
            messages: [],
            users: []
        }
        this.addMessage = this.addMessage.bind(this);
    }

    componentDidMount() {
        const chatManager = new ChatManager({
            instanceLocator: process.env.REACT_APP_INSTANCE_LOCATOR,
            userId: this.props.currentId,
            tokenProvider: new TokenProvider({
                url: process.env.REACT_APP_TOKEN_PROVIDER
            })
        });

        chatManager
        .connect()
        .then(currentUser => {
            this.setState({ currentUser: currentUser })
            return currentUser.subscribeToRoom({
                roomId: process.env.REACT_APP_ROOM_ID,
                messageLimit: 100,
                hooks: {
                    onMessage: message => {
                        this.setState({
                            messages: [...this.state.messages, message],
                        })
                    },
                }
            })
        })
        .then(currentRoom => {
            this.setState({
                currentRoom,
                users: currentRoom.userIds
            })
        })
        .catch(error => console.log(error));
    }

    addMessage(text) {
        this.state.currentUser.sendMessage({
            text,
            roomId: this.state.currentRoom.id
        })
        .catch(error => console.error('error', error));
    }

    render() {
        return (
            <div>
                <h2 className="header">Let's Talk</h2>
                <MessageList messages={this.state.messages} />
                <SendMessage className="input-field" onSubmit={this.addMessage} />
            </div>
        )
    }
}

export default ChatApp;