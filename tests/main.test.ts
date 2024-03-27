import sinon from "sinon";
import { expect } from "chai";
import { processFiles } from "../src/main.js";
import ac from "@actions/core";
import fs, { Dirent } from "fs";
import SidebarBuilder from "../src/SidebarBuilder.js";
import { files } from "./testing_utilities.js";
import { MainInputs } from "../src/types.js";


describe("processFiles", () => {
	const infoStub = sinon.stub(ac, "info");
	const warningStub = sinon.stub(ac, "warning");
	const writeFileSyncStub = sinon.stub(fs, "writeFileSync");
	const copyFileSyncStub = sinon.stub(fs, "copyFileSync");
	const readFileSyncStub = sinon.stub(fs, "readFileSync");

	beforeEach(() => {
		infoStub.reset();
		warningStub.reset();
		writeFileSyncStub.reset();
		copyFileSyncStub.reset();
		readFileSyncStub.reset();
	});

	const tempDir = "wiki-working-directory-123456789";


	const dir = {
		path: "",
		totalFiles: 13,
		dirs: [
			{
				path: "docs/dir1",
				totalFiles: 4,
				dirs: [],
				files: [
					...files.md,
				]
			},
			{
				path: "docs/dir2",
				totalFiles: 3,
				dirs: [],
				files: [
					...files.md.slice(0, 3),
				]
			},
			{
				path: "docs/dir3",
				totalFiles: 3,
				dirs: [
					{
						path: "docs/dir3/dir4",
						totalFiles: 3,
						dirs: [],
						files: [
							...files.md.slice(0, 2),
							files.sidebar
						]
					},
				],
				files: []
			},
			{
				path: "docs/dir5",
				totalFiles: 0,
				dirs: [],
				files: []
			},
		],
		files: [
			files.footer,
			files.home,
			files.md[0],
		]
	};

	describe("With sidebar", () => {
		it("Without file name prefixes ", () => {
			const data: MainInputs = {
				repo: "owner/repo",
				sidebar: true,
				folders: ["docs"],
				clearWiki: false,
				sidebarFileTypes: [".md", ".markdown"],
				prefixFilesWithDir: false,
				branchToLinkTo: "main",
				editWarning: true,
			};

			const sb = processFiles(dir, tempDir, data, true);
			expect(sb.dumps()).to.equal([
				"<!------------------------------------------------------------------------->",
				"<!--                🛑 DO NOT EDIT THIS FILE ON GITHUB 🛑                -->",
				"<!-- This file will be overwritten the next time the wiki is regenerated -->",
				"<!------------------------------------------------------------------------->",
				"",
				"<a href=\"/owner/repo/wiki/home\">Home</a><br>",
				"<a href=\"/owner/repo/wiki/file1\">File1</a><br>",
				"<details>",
				"<summary><strong>dir1</strong></summary>",
				"",
				"<a href=\"/owner/repo/wiki/file1\">File1</a><br>",
				"<a href=\"/owner/repo/wiki/file2\">File2</a><br>",
				"<a href=\"/owner/repo/wiki/file3\">File3</a><br>",
				"<a href=\"/owner/repo/wiki/file4\">File4</a><br>",
				"</details>",
				"<details>",
				"<summary><strong>dir2</strong></summary>",
				"",
				"<a href=\"/owner/repo/wiki/file1\">File1</a><br>",
				"<a href=\"/owner/repo/wiki/file2\">File2</a><br>",
				"<a href=\"/owner/repo/wiki/file3\">File3</a><br>",
				"</details>",
				"<details>",
				"<summary><strong>dir3</strong></summary>",
				"",
				"<details>",
				"<summary><strong>dir4</strong></summary>",
				"",
				"<a href=\"/owner/repo/wiki/file1\">File1</a><br>",
				"<a href=\"/owner/repo/wiki/file2\">File2</a><br>",
				"</details>",
				"</details>",
			].join("\n"));
			expect(copyFileSyncStub.callCount).to.equal(2);
			expect(infoStub.callCount).to.equal(1);
			expect(warningStub.callCount).to.equal(1);
			expect(writeFileSyncStub.callCount).to.equal(11);
			expect(readFileSyncStub.callCount).to.equal(11);
		});
		it("With file name prefixes ", () => {
			const data: MainInputs = {
				repo: "owner/repo",
				sidebar: true,
				folders: ["docs"],
				clearWiki: false,
				sidebarFileTypes: [".md", ".markdown"],
				prefixFilesWithDir: true,
				branchToLinkTo: "main",
				editWarning: false,
			};

			const sb = processFiles(dir, tempDir, data, true);
			expect(sb.dumps()).to.equal([
				"<a href=\"/owner/repo/wiki/home\">Home</a><br>",
				"<a href=\"/owner/repo/wiki/file1\">File1</a><br>",
				"<details>",
				"<summary><strong>dir1</strong></summary>",
				"",
				"<a href=\"/owner/repo/wiki/docs|dir1|file1\">File1</a><br>",
				"<a href=\"/owner/repo/wiki/docs|dir1|file2\">File2</a><br>",
				"<a href=\"/owner/repo/wiki/docs|dir1|file3\">File3</a><br>",
				"<a href=\"/owner/repo/wiki/docs|dir1|file4\">File4</a><br>",
				"</details>",
				"<details>",
				"<summary><strong>dir2</strong></summary>",
				"",
				"<a href=\"/owner/repo/wiki/docs|dir2|file1\">File1</a><br>",
				"<a href=\"/owner/repo/wiki/docs|dir2|file2\">File2</a><br>",
				"<a href=\"/owner/repo/wiki/docs|dir2|file3\">File3</a><br>",
				"</details>",
				"<details>",
				"<summary><strong>dir3</strong></summary>",
				"",
				"<details>",
				"<summary><strong>dir4</strong></summary>",
				"",
				"<a href=\"/owner/repo/wiki/docs|dir3|dir4|file1\">File1</a><br>",
				"<a href=\"/owner/repo/wiki/docs|dir3|dir4|file2\">File2</a><br>",
				"</details>",
				"</details>",
			].join("\n"));
			expect(copyFileSyncStub.callCount).to.equal(2);
			expect(infoStub.callCount).to.equal(1);
			expect(warningStub.callCount).to.equal(1);
			expect(writeFileSyncStub.callCount).to.equal(11);
			expect(readFileSyncStub.callCount).to.equal(11);
		});
	});
	describe("Without sidebar", () => {
		const possibilities = ["Without file name prefixes ", "With file name prefixes"];
		for (let i = 0; i < possibilities.length; i++) {
			it(possibilities[i], () => {
				const data: MainInputs = {
					repo: "owner/repo",
					sidebar: false,
					folders: ["docs"],
					clearWiki: false,
					sidebarFileTypes: [".md", ".markdown"],
					prefixFilesWithDir: Boolean(i),
					branchToLinkTo: "main",
					editWarning: false,
				};

				expect(processFiles(dir, tempDir, data, false)).to.be.undefined;
				expect(infoStub.callCount).to.equal(2);
				expect(copyFileSyncStub.callCount).to.equal(2);
				expect(warningStub.callCount).to.equal(0);
				expect(writeFileSyncStub.callCount).to.equal(11);
				expect(readFileSyncStub.callCount).to.equal(11);
			});
		}
	});

	it("with do not edit warning", () => {
		readFileSyncStub.returns("[file](../file.md 'subtitle')");
		const data: MainInputs = {
			repo: "owner/repo",
			sidebar: false,
			folders: ["docs"],
			clearWiki: false,
			sidebarFileTypes: [".md", ".markdown"],
			prefixFilesWithDir: false,
			branchToLinkTo: "main",
			editWarning: true,
		};

		const dir = {
			path: "docs",
			totalFiles: 1,
			dirs: [],
			files: [
				files.md[0],
			]
		};

		const sb = processFiles(dir, tempDir, data, true);
		expect(sb.dumps()).to.equal([
			"<!------------------------------------------------------------------------->",
			"<!--                🛑 DO NOT EDIT THIS FILE ON GITHUB 🛑                -->",
			"<!-- This file will be overwritten the next time the wiki is regenerated -->",
			"<!------------------------------------------------------------------------->",
			"",
			"<details>",
			"<summary><strong>docs</strong></summary>",
			"",
			"<a href=\"/owner/repo/wiki/file1\">File1</a><br>",
			"</details>",
		].join("\n"));
		expect(writeFileSyncStub.firstCall.args).to.deep.equal([
			"wiki-working-directory-123456789/generated/file1.md",
			[
				"<!------------------------------------------------------------------------->",
				"<!--                🛑 DO NOT EDIT THIS FILE ON GITHUB 🛑                -->",
				"<!-- This file will be overwritten the next time the wiki is regenerated -->",
				"<!--        Edit the source in docs/file1.md to change this file         -->",
				"<!------------------------------------------------------------------------->",
				"",
				`[file](/owner/repo/wiki/file "subtitle")`,
				""
			].join("\n")
		]);
	})

	after(() => {
		infoStub.restore();
		warningStub.restore();
		writeFileSyncStub.restore();
		copyFileSyncStub.restore();
		readFileSyncStub.restore();
	});
});