const { exec } = require("child_process");

// Get the commit message from the command-line arguments
const commitMessage = process.argv[2];

if (!commitMessage) {
    console.error("Error: Commit message is required.");
    console.error("Usage: node git-commands.js \"<commit-message>\"");
    process.exit(1);
}

// Function to execute a shell command
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Run the Git commands sequentially
(async () => {
    try {
        console.log("Running: git add .");
        await runCommand("git add .");
        console.log("Files added to staging.");

        console.log(`Running: git commit -m "${commitMessage}"`);
        await runCommand(`git commit -m "${commitMessage}"`);
        console.log("Changes committed.");

        console.log("Running: git push origin main");
        await runCommand("git push origin main");
        console.log("Changes pushed to origin/main.");
    } catch (error) {
        console.error(error);
    }
})();