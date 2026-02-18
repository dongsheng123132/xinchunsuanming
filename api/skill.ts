import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "fs";
import { join } from "path";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const skillPath = join(process.cwd(), "public", "skill.md");
    const content = readFileSync(skillPath, "utf-8");
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(content);
  } catch {
    res.status(404).json({ error: "skill.md not found" });
  }
}
