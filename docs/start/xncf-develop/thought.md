# NCF Modular Development Concept

NCF is built with a modular concept. Based on the underlying support library of the system, all functional modules appear in the form of "modules", "everything is a module".

> For example, data management functionality can be a module, the system kernel can be a module, the management backend can be a module, and business-level shopping cart can be a module, payment can be a module, evaluation can be a module, and so on. Even the functionality of visual module creation itself is also a module.

Using NCF's modular development has many benefits, such as:

1. Small-granularity function development, facilitating decoupling and unit testing;
1. Modules can call each other, facilitating function reuse;
1. Small-granularity release (supports Nuget package release), facilitating module function sharing;
1. Facilitating code and function migration;
1. Providing a unified modular interface, facilitating system integration (even existing systems can be integrated into NCF as a module with simple modifications);
1. Visual module templates, and multi-type freely selectable interface implementations, quickly building business base code;
1. Independent module installation and uninstallation can achieve complete database table isolation, without affecting each other, with high reliability;
1. Independent modules can be upgraded separately in small granularity, without affecting other modules;
1. And so on.

## Module Code

NCF's internal module code: `Xncf`, where `X` means Extension or Unknown, and `ncf` indicates that this module is rooted in the NCF framework.

For more module naming rules, please refer to: [Xncf Naming Rules](/start/xncf-develop/about-xncf.html#xncf-的命名规则).

## Q&A: Is it possible not to use modular development?

> Q: My system is relatively simple, and I don't need to consider migration, flexibility, or expansion. Can I develop directly on NCF?

> A: Of course. Loading modules is just for the convenience of decoupling and reusing the system. NCF is suitable for most development scenarios, including monolithic applications, distributed, containers, mobile terminals such as WeChat, cross-platform Hybrid applications, and so on.
