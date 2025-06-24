import * as readline from 'readline';
// Making sure the import path is correct for your project structure
import { handleLogin, handleRegister, handleVerification } from './services/commands';
import { connectWebSocket } from './services/communication';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Assuming handleVerification returns a Promise, e.g., Promise<void>
// If it doesn't, the 'await' will have no effect.

console.log("Welcome to e2e-cli-tool! Type /help for commands.");

rl.setPrompt('app> ');
rl.prompt();

// REPLACE your existing rl.on('line',...) with this entire block
// =============================================================
rl.on('line', async (line: string) => { // Added 'async'
  const [command, ...args] = line.trim().split(' ');

  try { // Added try...catch for robust error handling
    switch (command) {
      case '/register':
        await handleRegister(args[0]);
        break;
      case '/login':
        await handleLogin(args[0]);
        break;
      case '/verify':
        await handleVerification(args[0], args[1]);
        break; // Added the missing 'break'
      case '/connect':
        await connectWebSocket(args[0]);
      case '/help':
        console.log("Available commands: /register, /login, /verify <email> <otp>, /exit");
        break;
      case '/exit':
        rl.close();
        // Return here to avoid calling rl.prompt() from the finally block
        return; 
      default:
        console.log(`Unknown command: '${command}'. Type /help for a list of commands.`);
        break;
    }
  } catch (error) {
    // This will catch any errors from handleVerification or other commands
    console.error("An error occurred while executing the command:", error);
  } finally {
    // This ensures the prompt is always shown after a command completes
    rl.prompt();
  }
});
// =============================================================

rl.on('close', () => {
    console.log('Exiting the app. Hasta la Vista!');
    process.exit(0);
});