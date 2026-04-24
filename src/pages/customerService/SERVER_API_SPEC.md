# 云管家客服场景 - 服务端接口规范

> 本文档面向**后端开发/运维方**，描述前端「云管家」客服场景需要服务端提供的 HTTP 接口。
> 当前前端使用环信（Easemob）IM UIKit 实现实时聊天，所有与环信相关的认证、建群逻辑应由服务端封装后暴露给前端，**前端不直接调用环信 REST API**。

---

## 1. 接口总览

| 序号 | 接口名 | 触发时机 | 说明 |
|------|--------|---------|------|
| 1 | `GET /api/customer-service/config` | 进入「云管家」页面时 | 获取客服场景基础配置（AppKey、用户凭证等） |
| 2 | `POST /api/customer-service/session` | 点击某个服务卡片时 | 根据业务类型创建/复用客服群组，返回 groupId |

---

## 2. 接口详情

### 2.1 获取客服配置 - `GET /api/customer-service/config`

**触发时机**：用户进入「云管家」页面（`/customer-service`）时调用。

**用途**：
- 返回环信 AppKey
- 返回当前登录用户的 IM 账号（`userId`）和登录凭证（`token` 或 `password`）

**请求示例**：
```http
GET /api/customer-service/config HTTP/1.1
Authorization: Bearer <当前登录用户的 JWT Token>
Content-Type: application/json
```

**响应示例（成功）**：
```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "appKey": "your-org#your-app",
    "imUserId": "user_123456",
    "imToken": "YWMt...xyz",
    "imPassword": ""
  }
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `appKey` | `string` | 是 | 环信应用的 AppKey，格式为 `orgName#appName` |
| `imUserId` | `string` | 是 | 当前用户在环信 IM 中的唯一标识 |
| `imToken` | `string` | 二选一 | 环信 IM 登录 token（推荐，安全性更高） |
| `imPassword` | `string` | 二选一 | 环信 IM 登录密码（与 `imToken` 二选一即可） |

> **建议**：优先返回 `imToken`，避免前端持有明文密码。若使用 `imPassword`，请确保密码为服务端生成，与用户业务系统密码隔离。

**响应示例（失败）**：
```json
{
  "code": 401,
  "message": "用户未登录或 token 已过期"
}
```

---

### 2.2 创建/获取客服会话 - `POST /api/customer-service/session`

**触发时机**：用户在「云管家」页面点击某个服务卡片（如「跑腿代办」）时调用。

**用途**：
- 根据业务类型和用户身份，创建一个新的客服群组，或复用已有群组
- 返回群组的 `groupId`，前端凭此 `groupId` 进入聊天界面并设置当前会话

**请求示例**：
```http
POST /api/customer-service/session HTTP/1.1
Authorization: Bearer <当前登录用户的 JWT Token>
Content-Type: application/json

{
  "serviceType": "errand",
  "serviceName": "跑腿代办",
  "bizParams": {
    "sourcePage": "customer-service"
  }
}
```

**请求字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `serviceType` | `string` | 是 | 服务类型标识，如 `errand`（跑腿）、`medical`（就医）、`child`（儿童）、`elderly`（老人）、`pet`（宠物）、`travel`（文旅）、`sports`（运动）、`universal`（万能代办） |
| `serviceName` | `string` | 是 | 服务类型中文名，用于展示 |
| `bizParams` | `object` | 否 | 业务扩展参数，前端按需透传 |

**响应示例（成功 - 新建群组）**：
```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "sessionId": "sess_abc123",
    "groupId": "123456789",
    "groupName": "云管家-跑腿代办-客服群",
    "isNew": true,
    "createdAt": "2026-04-24T14:30:00+08:00"
  }
}
```

**响应示例（成功 - 复用已有群组）**：
```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "sessionId": "sess_abc123",
    "groupId": "123456789",
    "groupName": "云管家-跑腿代办-客服群",
    "isNew": false,
    "createdAt": "2026-04-20T10:00:00+08:00"
  }
}
```

**响应字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `sessionId` | `string` | 本次客服会话的唯一标识（业务层使用） |
| `groupId` | `string` | 环信 IM 群组 ID，前端需将其传入 UIKit 作为 `conversationId` |
| `groupName` | `string` | 群组名称，前端可在聊天标题栏展示 |
| `isNew` | `boolean` | 是否为本次新建的群组，`true` 表示新建，`false` 表示复用已有 |
| `createdAt` | `string` | 群组创建时间（ISO 8601 格式） |

**响应示例（失败 - 无可用客服）**：
```json
{
  "code": 503,
  "message": "当前服务类型暂无在线客服，请稍后重试"
}
```

---

## 3. 建群/复用逻辑建议

服务端在实现 `POST /api/customer-service/session` 时，建议遵循以下逻辑：

### 3.1 复用策略

同一用户在 **同一服务类型** 下，若已存在未关闭的客服群组，应**复用该群组**，避免创建过多冗余群。

```
查找条件：
  - 用户ID = 当前用户
  - 服务类型 = serviceType
  - 群组状态 = 未关闭（open）

若存在 -> 复用，返回已有 groupId
若不存在 -> 新建群组，返回新 groupId
```

### 3.2 新建群组流程

1. 调用环信 REST API 创建群组：`POST /{org}/{app}/chatgroups`
2. 将当前用户（`imUserId`）和对应客服账号加入群组
3. 将群组信息写入业务数据库，建立 `sessionId <-> groupId` 映射
4. 返回 `groupId` 给前端

### 3.3 群组生命周期管理

| 阶段 | 建议做法 |
|------|---------|
| **创建** | 用户首次点击某类服务时创建，群内默认加入用户本人 + 1 名在线客服 |
| **关闭** | 客服确认问题已解决后，调用环信 API 销毁/解散群组，或仅标记为「已关闭」 |
| **历史** | 已关闭的群组仍保留在环信中，用户可查看历史消息，但不能再发送新消息 |

---

## 4. 服务类型常量定义

前端当前定义了 8 类服务，建议服务端使用一致的 `serviceType` 标识：

| 展示名称 | serviceType |
|---------|-------------|
| 跑腿代办 | `errand` |
| 就医挂号 | `medical` |
| 儿童服务 | `child` |
| 老人便民 | `elderly` |
| 宠物服务 | `pet` |
| 文旅出行 | `travel` |
| 运动娱乐 | `sports` |
| 万能代办 | `universal` |

---

## 5. 时序图

```
用户              前端(H5)              业务服务端              环信服务器
 |                  |                      |                      |
 |--进入云管家----->|                      |                      |
 |                  |--GET /config------->|                      |
 |                  |                      |--查询用户IM信息------>|
 |                  |                      |<----返回imUserId-----|
 |                  |<----返回配置---------|                      |
 |                  |                      |                      |
 |--点击跑腿代办--->|                      |                      |
 |                  |--POST /session----->|                      |
 |                  |  serviceType=errand  |                      |
 |                  |                      |--查找已有群组---------|
 |                  |                      |  无 -> 调用环信API   |
 |                  |                      |  创建新群并拉人入群   |
 |                  |                      |<----返回groupId------|
 |                  |<----返回session------|                      |
 |                  |                      |                      |
 |                  |--UIKitProvider------>|                      |
 |                  |  appKey + imUserId   |                      |
 |                  |--client.open()-------------------------------->|
 |                  |  user + token        |                      |
 |                  |<--------------------登录成功----------------|
 |                  |                      |                      |
 |                  |--setCurrentConversation-------------------->|
 |                  |  conversationId=groupId                   |
 |<--进入聊天界面---|                      |                      |
 |                  |                      |                      |
```

---

## 6. 安全建议

1. **IM 凭证隔离**：用户的业务系统密码与环信 IM 密码应完全隔离，建议服务端使用 `imToken` 方式登录
2. **接口鉴权**：所有接口必须校验当前登录用户的 JWT Token，防止未授权访问
3. **敏感信息不落地**：AppKey、管理员 token 等敏感信息不应出现在前端代码中，需通过接口动态下发
4. **群成员权限**：新建群组时建议设置 `owner` 为客服账号，用户为 `member`，避免用户拥有管理权限

---

## 7. 前端适配说明（供参考）

当前前端代码中，配置信息（AppKey / userId / password / groupId）是手动填入的。接入真实服务端后，前端将按以下方式改造：

1. 进入「云管家」页面时调用 `GET /api/customer-service/config`，将返回的 `appKey`、`imUserId`、`imToken` 存入状态
2. 点击服务卡片时调用 `POST /api/customer-service/session`，将返回的 `groupId` 存入状态
3. 进入聊天页时，使用上述数据初始化 `UIKitProvider` 并执行 `client.open()` 登录

> 前端改造由前端开发负责，服务端只需按本文档实现上述 2 个接口即可。
