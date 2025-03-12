# 教育AI助手项目代码风格指南

本文档定义了教育AI助手项目的代码风格和最佳实践，以确保代码的一致性、可读性和可维护性。

## 目录

1. [通用规则](#通用规则)
2. [JavaScript/React 规则](#javascriptreact-规则)
3. [CSS/样式规则](#css样式规则)
4. [后端 Node.js 规则](#后端-nodejs-规则)
5. [文件组织](#文件组织)
6. [命名约定](#命名约定)
7. [注释规范](#注释规范)
8. [Git 工作流](#git-工作流)

## 通用规则

- 使用 UTF-8 编码
- 使用 LF 作为行结束符
- 文件末尾保留一个空行
- 删除行尾空格
- 最大行长度为 100 个字符
- 使用 2 个空格缩进
- 使用分号结束语句
- 使用单引号作为字符串引用符

## JavaScript/React 规则

### 基本格式

- 使用 ES6+ 语法
- 优先使用箭头函数
- 使用解构赋值
- 使用模板字符串
- 使用 `const` 和 `let`，避免使用 `var`
- 使用扩展运算符而不是 `.apply()`

### React 组件

- 使用函数组件和 Hooks，而不是类组件
- 每个文件只包含一个 React 组件
- 组件名使用 PascalCase
- 组件属性使用 camelCase
- 使用 JSX 扩展名 (.jsx) 表示包含 JSX 的文件
- 使用 React.memo() 优化渲染性能
- 使用 PropTypes 或 TypeScript 进行类型检查
jsx
// 好的例子
const UserProfile = React.memo(({ user, onUpdate }) => {
const { name, email } = user;
return (
<div className="user-profile">
<h2>{name}</h2>
<p>{email}</p>
<button onClick={() => onUpdate(user.id)}>更新</button>
</div>
);
});
UserProfile.propTypes = {
user: PropTypes.shape({
id: PropTypes.string.isRequired,
name: PropTypes.string.isRequired,
email: PropTypes.string.isRequired
}).isRequired,
onUpdate: PropTypes.func.isRequired
};

### Hooks 使用

- 遵循 Hooks 的使用规则
- 自定义 Hooks 名称以 `use` 开头
- 在 useEffect 中正确处理清理函数
- 使用 useCallback 和 useMemo 优化性能
jsx
// 好的例子
const useUserData = (userId) => {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
let isMounted = true;
const fetchUser = async () => {
try {
const data = await api.getUser(userId);
if (isMounted) {
setUser(data);
setLoading(false);
}
} catch (error) {
if (isMounted) {
console.error('Failed to fetch user:', error);
setLoading(false);
}
}
};
fetchUser();
return () => {
isMounted = false;
};
}, [userId]);
return { user, loading };
};

## CSS/样式规则

- 使用 Material-UI 的 `sx` 属性或 styled-components 进行样式设置
- 避免内联样式，除非是动态计算的值
- 使用语义化的类名
- 使用 flexbox 或 grid 进行布局
- 使用主题变量而不是硬编码的颜色和尺寸
jsx:docs/code-style-guide.md
// 好的例子 - 使用 Material-UI sx 属性
<Box
sx={{
display: 'flex',
flexDirection: 'column',
gap: 2,
p: 3,
bgcolor: 'background.paper',
borderRadius: 1,
boxShadow: 1
}}
>
{/ 内容 /}
</Box>
// 好的例子 - 使用 styled-components
const StyledCard = styled(Paper)(({ theme }) => ({
padding: theme.spacing(3),
borderRadius: theme.shape.borderRadius,
backgroundColor: theme.palette.background.paper,
boxShadow: theme.shadows[1]
}));

## 后端 Node.js 规则

- 使用 async/await 处理异步操作
- 使用 try/catch 进行错误处理
- 使用环境变量存储配置
- 使用中间件处理通用逻辑
- 使用结构化的日志记录
- 使用参数验证
javascript
// 好的例子
router.post('/users',
validateUserInput,
async (req, res) => {
try {
const { name, email, password } = req.body;
const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({
name,
email,
password: hashedPassword
});
logger.info(User created: ${user.id});
res.status(201).json({ id: user.id, name: user.name });
} catch (error) {
logger.error('User creation failed:', error);
res.status(500).json({ error: 'Failed to create user' });
}
}
);

### 错误处理

- 使用自定义错误类
- 在 API 响应中提供有意义的错误消息
- 使用 HTTP 状态码表示错误类型
- 在生产环境中隐藏敏感的错误详情
javascript
// 自定义错误类
class ApiError extends Error {
constructor(message, statusCode, details = null) {
super(message);
this.statusCode = statusCode;
this.details = details;
this.name = this.constructor.name;
}
}
// 错误处理中间件
const errorHandler = (err, req, res, next) => {
const statusCode = err.statusCode || 500;
const message = err.message || '服务器内部错误';
// 在开发环境中提供更多详情
const response = {
error: message,
...(process.env.NODE_ENV === 'development' && {
stack: err.stack,
details: err.details
})
};
logger.error(${statusCode} - ${message}, {
url: req.originalUrl,
method: req.method,
...(err.details && { details: err.details })
});
res.status(statusCode).json(response);
};

## 文件组织

- 按功能或特性组织文件，而不是按文件类型
- 使用一致的目录结构
- 相关文件放在同一目录下
- 使用 index.js 文件导出目录内容
src/
components/
common/ # 通用组件
layout/ # 布局组件
features/ # 特定功能组件
teachPlan/ # 教案相关组件
resources/ # 资源相关组件
contexts/ # React 上下文
hooks/ # 自定义 Hooks
services/ # API 服务
utils/ # 工具函数
pages/ # 页面组件
assets/ # 静态资源

## 命名约定

- 文件名：使用 PascalCase 命名组件文件，使用 camelCase 命名其他文件
- 变量和函数：使用 camelCase
- 常量：使用 UPPER_SNAKE_CASE
- 组件：使用 PascalCase
- CSS 类名：使用 kebab-case
javascript
// 常量
const MAX_ITEMS_PER_PAGE = 20;
const API_BASE_URL = 'https://api.example.com';
// 变量和函数
const getUserData = async (userId) => {
const response = await fetch(${API_BASE_URL}/users/${userId});
return response.json();
};
// 组件
const UserProfileCard = ({ user }) => {
// ...
};

## 注释规范

- 使用 JSDoc 风格的注释
- 注释应该解释"为什么"而不是"是什么"
- 复杂的函数应该有注释说明其目的、参数和返回值
- 使用 TODO、FIXME 等标记突出需要关注的代码
javascript
/
获取用户的活动历史
@param {string} userId - 用户ID
@param {Object} options - 查询选项
@param {number} options.limit - 返回结果的最大数量
@param {string} options.sortBy - 排序字段
@returns {Promise<Array>} 用户活动列表
/
async function getUserActivities(userId, options = {}) {
// 实现...
}
// TODO: 实现分页功能
// FIXME: 修复在某些浏览器中的兼容性问题

## Git 工作流

- 使用 feature 分支进行开发
- 提交消息使用现在时态，简明扼要
- 每个提交应该是一个逻辑单元
- 在提交前运行 lint 和测试
- 使用 Pull Request 进行代码审查

### 分支命名

- `feature/xxx`：新功能
- `fix/xxx`：修复bug
- `docs/xxx`：文档更改
- `refactor/xxx`：代码重构
- `test/xxx`：测试相关

### 提交消息格式
<type>(<scope>): <subject>
<body>
<footer>

类型：
- feat: 新功能
- fix: 修复bug
- docs: 文档更改
- style: 不影响代码含义的更改（空格、格式等）
- refactor: 既不修复bug也不添加功能的代码更改
- perf: 提高性能的代码更改
- test: 添加或修正测试
- chore: 对构建过程或辅助工具的更改

示例：
feat(auth): 添加用户登录功能
实现了基于JWT的用户认证系统，包括登录、注销和令牌刷新功能。
Closes #123

## 性能优化

- 使用 React.memo 避免不必要的重新渲染
- 使用 useCallback 和 useMemo 缓存函数和计算结果
- 使用虚拟列表渲染大量数据
- 实现代码分割和懒加载
- 优化图片和资源加载
- 使用缓存减少重复请求
jsx
// 使用 React.lazy 和 Suspense 进行代码分割
const UserDashboard = React.lazy(() => import('./UserDashboard'));
function App() {
return (
<Suspense fallback={<div>Loading...</div>}>
<UserDashboard />
</Suspense>
);
}

遵循这些规则和最佳实践将帮助我们保持代码库的一致性和可维护性，提高开发效率和代码质量。