﻿中青旅新浪微博应用
====================

客户项目，是一个新浪微博企业应用。页面简单，交互也简单。数据完全从接口读取，通过模板编译绘制到前台。使用了RequireJS解决依赖关系和模块化开发，用Backbone构建MVC架构，Backbone.Router做适配器。就这个项目来说，完全没必要使用这种方式，这使代码看起来更复杂难懂，而且项目也不适合纯接口数据交互的方式。

**纯粹是因为我认为这种“大前端”的开发方式真的很爽。**

注意：本程序需要通过配置接口地址等操作后才能够运行。另外，打包后的JS并未传上来，需要修改首页的RequireJS文件路径。

由于种种原因，本项目的线上版本已放弃了这种写法。

在这个过程中，我思索良多。