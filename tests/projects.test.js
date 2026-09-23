import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { PROJECTS } from "../src/constants/const.js";

test("every project has a unique stable detail URL and a logo", () => {
  const slugs = PROJECTS.map((project) => project.slug);
  for (const project of PROJECTS) {
    assert.match(
      project.slug ?? "",
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      project.title,
    );
    assert.ok(
      existsSync(new URL(`../src/assets/${project.image}`, import.meta.url)),
      `${project.title}: logo`,
    );
  }
  assert.equal(new Set(slugs).size, PROJECTS.length);
});

test("each project has personal reflections and valid local gallery assets", () => {
  for (const project of PROJECTS) {
    assert.ok(project.reflections?.length > 0, `${project.title}: reflections`);
    for (const reflection of project.reflections) {
      assert.ok(reflection.title && reflection.description);
      assert.match(
        reflection.description,
        /\bI\b/,
        `${project.title}: first-person narrative`,
      );
    }
    for (const screenshot of project.screenshots) {
      assert.ok(
        existsSync(
          new URL(`../src/assets/projects/${screenshot}`, import.meta.url),
        ),
      );
    }
  }
});
