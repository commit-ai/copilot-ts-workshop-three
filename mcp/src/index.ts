import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Powerstats {
	intelligence: number;
	strength: number;
	speed: number;
	durability: number;
	power: number;
	combat: number;
}

interface Superhero {
	id: string | number;
	name: string;
	image: string;
	powerstats: Powerstats;
}

async function loadSuperheroes(): Promise<Superhero[]> {
	try {
		const data = await fs.promises.readFile(
			path.join(__dirname, "../data", "superheroes.json"),
			"utf-8"
		);
		return JSON.parse(data) as Superhero[];
	} catch (err) {
		throw new Error(
			`Failed to load superheroes data: ${err instanceof Error ? err.message : String(err)}`
		);
	}
}

function formatSuperheroMarkdown(hero: Superhero): string {
	return `Here is the data for ${hero.name} retrieved using the superheroes MCP:\n\n• Name: ${hero.name}\n• Image: <img src="${hero.image}" alt="${hero.name}"/>\n• Powerstats:\n  • Intelligence: ${hero.powerstats.intelligence}\n  • Strength: ${hero.powerstats.strength}\n  • Speed: ${hero.powerstats.speed}\n  • Durability: ${hero.powerstats.durability}\n  • Power: ${hero.powerstats.power}\n  • Combat: ${hero.powerstats.combat}`;
}

const server = new McpServer(
	{
		name: "superheroes-mcp",
		version: "1.0.0",
	},
	{
		capabilities: {
			resources: {},
			tools: {},
		},
	}
);

server.tool(
	"get_superhero",
	"Get superhero details by name or id",
	{
		name: z.string().describe("Name of the superhero (optional)").default(""),
		id: z.string().describe("ID of the superhero (optional)").default(""),
	},
	async ({ name, id }) => {
		const superheroes = await loadSuperheroes();

		const nameLc = name.toLowerCase();
		const idStr = id.toString();

		const superhero = superheroes.find((hero) => {
			const heroNameLc = hero.name?.toLowerCase() ?? "";
			const heroIdStr = hero.id?.toString() ?? "";

			const nameMatches = nameLc.length > 0 && heroNameLc === nameLc;
			const idMatches = idStr.length > 0 && heroIdStr === idStr;

			return nameMatches || idMatches;
		});

		if (!superhero) {
			throw new Error("Superhero not found");
		}

		return {
			content: [
				{
					type: "text",
					text: formatSuperheroMarkdown(superhero),
				},
			],
		};
	}
);

server.tool(
	"list-superheroes",
	"Get a list of all superheroes with their IDs and names",
	{},
	async () => {
		const superheroes = await loadSuperheroes();

		const listOutput = superheroes
			.map((hero) => `• ID: ${hero.id} - ${hero.name}`)
			.join("\n");

		return {
			content: [
				{
					type: "text",
					text: listOutput,
				},
			],
		};
	}
);

server.tool(
	"compare-superheroes",
	"Compare two superheroes across all six powerstat dimensions",
	{
		hero1_id: z.string().describe("ID of the first superhero (required)"),
		hero2_id: z.string().describe("ID of the second superhero (required)"),
	},
	async ({ hero1_id, hero2_id }) => {
		const superheroes = await loadSuperheroes();

		const hero1 = superheroes.find((hero) => hero.id?.toString() === hero1_id.toString());
		const hero2 = superheroes.find((hero) => hero.id?.toString() === hero2_id.toString());

		if (!hero1 || !hero2) {
			throw new Error("Superhero not found");
		}

		const stats: (keyof Powerstats)[] = [
			"intelligence",
			"strength",
			"speed",
			"durability",
			"power",
			"combat",
		];

		let hero1Total = 0;
		let hero2Total = 0;

		const lines: string[] = [`Comparing ${hero1.name} vs ${hero2.name}`];

		for (const stat of stats) {
			const val1 = hero1.powerstats?.[stat] ?? 0;
			const val2 = hero2.powerstats?.[stat] ?? 0;

			hero1Total += val1;
			hero2Total += val2;

			const winner = val1 > val2 ? hero1.name : val1 < val2 ? hero2.name : "Tie";
			lines.push(
				`${stat}: ${hero1.name} (${val1}) vs ${hero2.name} (${val2}) - Winner: ${winner}`
			);
		}

		const overallWinner =
			hero1Total > hero2Total ? hero1.name : hero1Total < hero2Total ? hero2.name : "Tie";

		lines.push(
			`Overall winner: ${overallWinner} (${Math.max(hero1Total, hero2Total)} total stats)`
		);

		return {
			content: [
				{
					type: "text",
					text: lines.join("\n"),
				},
			],
		};
	}
);

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error("Superhero MCP Server running on stdio");
}

main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});