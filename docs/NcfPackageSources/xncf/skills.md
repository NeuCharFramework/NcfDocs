# Skill import, testing and publication

<a id="help-prompt-skills"></a>

## Skills

### Operating sequence

1. Choose a source: local package, remote ZIP/Release, GitHub folder or AI generation.
2. Inspect the Draft Manifest, actual files and declared permissions against the intended capability.
3. Test its behavior and correct the Draft before publication.
4. Check the published Skill available to the target Agent or AdminChat; an existing Draft is not proof that it is active.

### Draft and publication boundaries

Import from ZIP/Release URLs, local uploads or GitHub folders, or use AI to create/modify a Skill.
Imports and AI generation produce **Draft** versions. Preview the Manifest, files and permissions and test before publishing
to Agent or AdminChat. **Generate Draft Skill** is not publication; preview does not execute the Skill.
Skill instructions are not permission grants. Do not include secrets in skill
files or assume imported instructions are safe to execute without review.
