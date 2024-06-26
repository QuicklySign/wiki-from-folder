
import exec from "@actions/exec";
import { EMAIL_REGEX } from "./utils.js";

/**
 * An error class for errors that occur during execution of shell commands.
 */
class ExecError extends Error {
	constructor(message: string) {
		super(message);
	}
}

/**
 * Set the global git user.email and user.name
 * @param email - default: `action@github.com`
 * @param name - default: `action`
 * @throws SyntaxError
 * @throws ExecError
 */
export async function configureGit(email = "action@github.com", name = "actions-user") {
	if (!EMAIL_REGEX.test(email)) throw new SyntaxError("Invalid email syntax");
	let errorAccumulator = 0;
	errorAccumulator += await exec.exec(`git config --global --add safe.directory ${process.cwd()}`);
	errorAccumulator += await exec.exec(`git config --global user.email ${email}`);
	errorAccumulator += await exec.exec(`git config --global user.name ${name}`);
	if (errorAccumulator > 0) {
		throw new ExecError(`Failed to initialize git [${errorAccumulator}]`);
	}
}
/**
 * Add, commit and push a list of files with the given message
 * @param files The list of files to push
 * @param message The commit message
 * @throws ExecError
 */
export async function commitAndPush(files: string[], message: string) {
	let errorAccumulator = 0;
	errorAccumulator += await exec.exec(`git add ${files.join(" ")}`);
	errorAccumulator += await exec.exec(`git commit -m "${message}"`);
	errorAccumulator += await exec.exec("git push");
	if (errorAccumulator > 0) {
		throw new ExecError(`Failed to commit and push [${errorAccumulator}]`);
	}
}

/**
 * Clone the wiki for a given repo to a specified folder.
 * @param repo - The name of the repo to clone the wiki for in the form `owner/repo`
 * @param host - The host to clone the wiki from. Typically `https://github.com`
 * @param cloneTo - The name of the folder to clone the wiki to
 * @throws ExecError
 */
export async function cloneWiki(repo: string, host: string, cloneTo: string) {
	let errorAccumulator = 0;
	errorAccumulator += await exec.exec("gh", ["auth", "setup-git"]);
	errorAccumulator += await exec.exec("git", ["clone", "--depth=1", `${host}/${repo}.wiki.git`, cloneTo]);

	if (errorAccumulator > 0) {
		throw new ExecError(`Failed to clone wiki [${errorAccumulator}]`);
	}
}