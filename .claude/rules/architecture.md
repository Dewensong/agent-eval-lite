# 代码架构分层规范

本文件是 AGENTS.md "代码架构分层"的详细展开。仅在代码型或混合型项目中生效。

## 核心原则

遵循 **关注点分离（Separation of Concerns）**：每一层只做一件事，层与层之间通过明确的接口通信。

类比：餐厅运营
- **Controller** = 服务员（接单、传菜，不炒菜）
- **Service** = 厨师（掌握菜谱，调用食材但不亲自采购）
- **Repository** = 采购/仓储（只管食材进出，不管怎么做菜）

---

## 一、后端分层

### 1. Controller — HTTP 翻译层

唯一职责：把 HTTP 请求翻译成 Service 调用，再把 Service 结果翻译成 HTTP 响应。

```typescript
// ✅ 正确：Controller 只做翻译
class UserController {
  constructor(private userService: UserService) {}

  async getById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: '无效的 ID' });
    
    const user = await this.userService.findById(id);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    
    res.json(user);
  }
}
```

```typescript
// ❌ 错误：Controller 包含业务逻辑
class UserController {
  async getById(req: Request, res: Response) {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (user.role === 'admin') { /* 业务判断 */ }
    res.json(user);
  }
}
```

**边界：**
- ✅ 提取参数、校验格式、调用 Service、返回响应
- ❌ 任何业务判断、直接数据库操作、调用第三方 API

### 2. Service — 业务逻辑层

唯一职责：承载所有业务规则，编排数据访问和外部服务。

```typescript
// ✅ 正确：Service 承载业务规则
class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderDto> {
    // 1. 业务校验
    const stock = await this.inventoryService.checkStock(dto.productId);
    if (stock < dto.quantity) throw new BusinessError('库存不足');

    // 2. 业务操作
    const order = await this.orderRepo.create(dto);
    await this.inventoryService.reserve(dto.productId, dto.quantity);

    // 3. 副作用
    await this.paymentService.createPending(order.id, order.totalAmount);

    return toOrderDto(order);
  }
}
```

```typescript
// ❌ 错误：Service 直接写 SQL 或处理 HTTP 对象
class OrderService {
  async create(req: Request) {
    const result = await db.raw('INSERT INTO orders ...');
    res.status(201).json(result); // Service 不应知道 HTTP
  }
}
```

**边界：**
- ✅ 业务规则校验、编排多个 Repository/外部服务、事务管理、数据转换
- ❌ 直接写 SQL、处理 req/res、知道自己被 REST 还是 GraphQL 调用

### 3. Repository — 数据访问层

唯一职责：封装所有数据库交互，对外暴露语义化的数据访问方法。

```typescript
// ✅ 正确：Repository 封装数据访问
class UserRepository {
  constructor(private db: Database) {}

  async findById(id: number): Promise<User | null> {
    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  }

  async findActiveByRole(role: string): Promise<User[]> {
    return this.db.query(
      'SELECT * FROM users WHERE role = $1 AND status = $2',
      [role, 'active']
    );
  }
}
```

```typescript
// ❌ 错误：Repository 包含业务判断
class UserRepository {
  async findById(id: number): Promise<User | null> {
    const user = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (user.role !== 'admin') throw new Error('非管理员'); // 业务判断不应在此
    return user;
  }
}
```

**边界：**
- ✅ CRUD、复杂查询、分页、数据聚合
- ❌ 业务判断、调用外部 API、发通知

### 4. 横切层

| 层 | 职责 | 示例 |
|----|------|------|
| **Middleware** | 请求预处理 | 认证、CORS、请求日志、参数校验 |
| **Routes** | 路由注册 | 把 URL 和方法映射到 Controller |
| **Config** | 环境配置 | 数据库连接、API Key、端口号 |
| **Utils** | 纯工具函数 | 日期格式化、加密、ID 生成 |

### 5. 层间数据传递规则

```
Controller 接收/返回 → DTO（数据传输对象）
Service 内部使用    → Domain Model（领域模型）
Repository 返回     → Entity（数据库实体）

转换发生在层边界：
Controller  →  DTO → Service  →  Domain → Repository  →  Entity → DB
```

---

## 二、前端分层

### 1. Page — 页面组装层

```typescript
// ✅ Page 只负责组装
function UserProfilePage() {
  const { user, loading, error } = useUserProfile();
  
  if (loading) return <PageSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <Layout>
      <UserHeader user={user} />
      <UserDetail user={user} />
      <UserOrders userId={user.id} />
    </Layout>
  );
}
```

### 2. Component — 纯 UI 渲染

```typescript
// ✅ Component 只渲染，不请求
function UserHeader({ user }: { user: User }) {
  return (
    <Card>
      <Avatar src={user.avatar} />
      <Name>{user.name}</Name>
      <Badge>{user.role}</Badge>
    </Card>
  );
}
```

**边界：** 接收 props → 渲染 UI → 触发事件回调。不调 API，不含业务分支。

### 3. Service — API 调用层

```typescript
// ✅ Service 封装所有网络请求
const userService = {
  getById: (id: number): Promise<UserDto> =>
    api.get(`/users/${id}`),
  
  update: (id: number, data: UpdateUserDto): Promise<UserDto> =>
    api.patch(`/users/${id}`, data),
};
```

### 4. Hook — 状态逻辑层

```typescript
// ✅ Hook 持有状态，调用 Service
function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    userService.getById(currentUserId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
```

### 5. Store — 全局状态

仅用于跨页面共享的状态（用户登录态、主题设置、全局配置）。页面私有状态用 Hook，不要放进 Store。

---

## 三、两种目录组织

### 分层组织（默认，推荐起步用）

```
src/
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── utils/
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
└── shared/
    ├── types/
    └── constants/
```

**适用场景**：功能数 < 10，团队 1-3 人，项目初期。
**优点**：结构一眼清晰，新人快速定位。
**缺点**：功能多了以后，改一个功能要跳 6 个文件夹。

### 垂直切片（功能 > 10 个后迁移）

```
src/
├── features/
│   ├── auth/
│   │   ├── controller.ts
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   ├── components/
│   │   ├── pages/
│   │   └── types.ts
│   └── orders/
│       └── ...
├── shared/
│   ├── db/
│   ├── middleware/
│   └── ui-components/
```

**适用场景**：功能 > 10 个，多人并行开发。
**优点**：改一个功能只在一个文件夹里。
**迁移方式**：渐进式。哪个模块先膨胀就先抽成切片，不要一次性全改。

---

## 四、常见反模式

| 反模式 | 表现 | 后果 |
|--------|------|------|
| **胖 Controller** | Controller 里写业务逻辑、查数据库 | 无法复用，测试困难 |
| **贫血 Service** | Service 只转发 Repository 调用 | Service 层变成冗余 |
| **Repository 含业务** | Repository 里做权限判断、数据校验 | 业务逻辑分散 |
| **跨层调用** | Controller 直接调 Repository | 绕过业务逻辑 |
| **过早抽象** | 项目只有 3 个接口就上垂直切片、DI 容器 | 增加不必要的复杂度 |

---

## 五、与 AGENTS.md 的衔接

本文件是 AGENTS.md 中"代码架构分层"的详细版。项目进入时的优先级：

1. `README.md` → 知道项目是什么
2. `AGENTS.md` → 知道怎么协作
3. `context.md` → 知道业务约束
4. **本文件** → 知道代码怎么组织（代码型项目）
5. `.claude/rules/` 下的其他文件 → 具体领域规范
