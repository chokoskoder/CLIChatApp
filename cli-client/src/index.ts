import * as readline from 'readline';
import { handleLogin, handleRegister } from './commands';

const rl = readline.createInterface({
	input : process.stdin , 
	output : process.stdout

})

console.log("Welcome to e2e-cli-tool! Types /help for commands.");

rl.setPrompt('app>');
rl.prompt();

rl.on('line' , (line : string) => {
	const [command , ...args] = line.trim().split(' ');

	//we will use switch statement for faster respones
	switch(command){
		case '/register':
			handleRegister();
			break;
		case '/login':
			handleLogin();
			break;
		case '/help':
			console.log("the available commands ");
			break;
		case '/exit':
			rl.close();
			break;
		default:
			console.log(`Unknown command: '${command}'. Type /help for a list of commands.`);
			break;

	}
	rl.prompt();
});

rl.on('close' , ()=>{
	console.log('exiting the chat app. Hasta la Vista ');
	process.exit(0);
});


/**
 * // const args = process.argv.slice(2) //this so that we only work with the user's input 

// const command = args[0]; //the first command we enter will be our main command and everything that follows will be its arguments

// console.log(`the command we are going to run is ${command}`);
// now we need to define which commands are going to have and how many args will they have ?
// for now we are going to have two commands : register and login for user authentication and setting up the foundation of our e2e structure

// if(command === 'register'){
// 	console.log("Starting the registration process....");
// 	we will call all the registration shit here , i am thinking of a simple gmail based sign up ,
// 	i will send them an OTP and they will check return if OTP is correct we enter them into our DB
// }
// else if(command === 'login'){
// 	console.log("starting the signing in process....");
// 	this is fairly simple , login with gmail and enter OTP sent to their mail 
// 	now this is not the most secure way i know , but cut me some slack the damn messages are e2e encrypted at least !
// }
// else{
// 	console.log("unknown command , available commands are : login and register");	
// }

// the above code is not good for an interactive session as for each command we will have to run the script again and again 
// so we will be switching to REPL , read eval print loop , which is used for cli based tools 
 */