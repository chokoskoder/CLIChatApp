import * as readline from 'readline';
// Making sure the import path is correct for your project structure
import { handleChat, handleLogin, handleRegister, handleVerification } from './services/commands';
import { connectWebSocket, sendMessage } from './services/communication';
import { Socket } from 'socket.io-client';
import { useJWTSignInKey } from './services/protectInformation';



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentMode: 'command' | 'chat' = 'command';
let socket: Socket | null = null;
let recipientID : string  ;
console.log("Welcome to e2e-cli-tool! Type /help for commands.");

rl.setPrompt('app> ');
rl.prompt();

rl.on('line', async (line: string) => {
    const input = line.trim();
    if (currentMode === 'chat') {
        if (input === '/exit-chat') {
            currentMode = 'command';
            console.log("Exited chat mode. You are now in command mode.");
            rl.setPrompt('app> ');
        } else {
            if (socket) {
                console.log(recipientID)
                sendMessage(socket, input , recipientID); // Send the line as a message
            } else {
                console.error("Error: Socket is not connected.");
                currentMode = 'command'; // Revert to command mode
                rl.setPrompt('app> ');
            }
        }
    }
    else if (currentMode === 'command') {
        const [command, ...args] = input.split(' ');
        try {
            switch (command) {
                case '/register':
                    await handleRegister(args[0]);
                    break;
                case '/login':
                    const token = await handleLogin(args[0]);
                    break;
                case '/verify':
                    await handleVerification(args[0], args[1]);
                    break;
                case '/connect':
                    const authToken = await useJWTSignInKey(); 
                    socket = connectWebSocket(authToken);
                    console.log("Connecting...");
                    break;
                case '/chat':
                    if (socket && socket.connected) {
                        recipientID = args[0];
                        currentMode = 'chat';
                        //now we need to call the function to create the shared secret 
                        console.log("💬 Entered chat mode. Type '/exit-chat' to return to commands.");
                        //rl.setPrompt('chat> ');
                    } else {
                        console.log("You must be connected to start a chat. Use /connect first.");
                    }
                    break;
                case '/help':
                    console.log("Available commands: /register, /login, /verify, /connect, /chat, /exit");
                    break;
                case '/exit':
                    rl.close();
                    return;
                default:
                    console.log(`Unknown command: '${command}'. Type /help for commands.`);
                    break;
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    }

    rl.prompt(); 
});

rl.on('close', () => {
    console.log('Exiting the app. Hasta la Vista!');
    process.exit(0);
});