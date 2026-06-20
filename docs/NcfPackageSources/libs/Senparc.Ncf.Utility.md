# Senparc.Ncf.Utility

## Positioning

`Senparc.Ncf.Utility` is the shared utility toolbox for NCF, covering string/date/file/reflection/expression helper capabilities.

## Key Folders

- `Extensions`: `StringExtensions`, `DateTimeExtensions`, `IntegerExtensions`
- `ExpressionExtension`: dynamic expression/query helpers
- `StreamExtensions`: stream wrappers and helpers
- `Helpers`: reflection/culture utility helpers
- `DIExtension`: dependency-injection extensions

## Typical Uses

- reusable dynamic filtering/sorting expressions
- unified file/path helper usage
- reducing repeated low-level utility code in business modules

## Recommendations

- Keep only stable, reusable, domain-agnostic helpers here.
- Avoid placing business policy helpers in Utility to maintain architectural boundaries.
