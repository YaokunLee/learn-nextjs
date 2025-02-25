'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}

// 在 Next.js 中，**这个组件必须显式标记为 `use client`（客户端组件）**，原因与以下特性相关：

// ---

// ### **1. 依赖客户端运行时的库**
// - **`@heroicons/react` 图标组件**：  
//   Heroicons 的 React 图标库是基于客户端 React 组件实现的。服务端组件（默认无客户端 JS）无法渲染这类依赖浏览器环境的组件。

// ---

// ### **2. 动态交互与样式**
// - **`:focus` 伪类样式**：  
//   组件中使用了 `peer-focus:text-gray-900`，这是 Tailwind CSS 的动态伪类（依赖用户交互状态）。服务端组件无法实时响应浏览器事件（如聚焦输入框），因此这类动态样式在服务端渲染时会失效。

// ---

// ### **3. 组件位置和布局**
// - **绝对定位（`absolute`）**：  
//   `MagnifyingGlassIcon` 的 `left-3` 和 `-translate-y-1/2` 需要根据输入框的实际尺寸动态计算位置。服务端渲染时无法获取 DOM 元素的精确尺寸，导致布局错位。

// ---

// ### **4. 服务端组件的限制**
// - **无客户端生命周期**：  
//   服务端组件不支持 `useEffect`、`useState` 等客户端钩子，也无法处理用户交互事件（如点击、输入）。
// - **静态渲染问题**：  
//   服务端组件仅能渲染初始 HTML，无法动态更新（如输入框聚焦时的样式变化）。

// ---

// ### **为什么不能作为服务端组件？**
// 如果省略 `use client`，Next.js 会默认将此组件视为服务端组件，导致以下问题：
// 1. **图标不显示**：  
//    `@heroicons/react` 组件在服务端渲染时会被忽略或报错。
// 2. **动态样式失效**：  
//    `:focus` 相关的样式无法生效，输入框聚焦时颜色不会变化。
// 3. **布局错位**：  
//    图标的位置基于服务端计算的静态尺寸，可能与客户端实际渲染的输入框尺寸不符。

// ---

// ### **如何验证这一点？**
// 1. **临时改为服务端组件**：  
//    删除 `use client` 并尝试部署，观察以下现象：
//    - 控制台报错：`React component cannot be rendered as a service worker`.
//    - 图标消失或变成占位符。
//    - 输入框聚焦时样式无变化。

// 2. **强制客户端渲染**：  
//    即使不使用 Heroicons，仅保留输入框和动态样式，服务端组件仍无法正确应用 `:focus` 样式。

// ---

// ### **解决方案**
// - **必须标记为客户端组件**：  
//   在组件顶部添加 `use client`，强制 Next.js 通过动态导入注入客户端 JS。
// - **替代方案**：  
//   如果坚持使用服务端组件，需手动替换所有客户端依赖（如用 SVG 图标代替 Heroicons，并用静态内联样式替代动态伪类）。

// ---

// ### **总结**
// 该组件依赖 **动态交互、浏览器 API 和第三方客户端库**，因此必须作为客户端组件运行。服务端组件的核心优势（无客户端体积、直接渲染 HTML）与此场景的需求冲突。