import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

type Position = {
  x: number;
  y: number;
};

type Project = {
  id: number;
  title: string;
  anchorX: number;
  anchorY: number;
  thumbnail: string;
  view?: 'languages' | 'bands' | 'thanks' | 'blogs';
};

type Language = {
  name: string;
  icon: string;
  description: string;
};

type BandEntry = {
  name: string;
  image: string;
  images?: string[];
  description: string;
  objectPosition?: string;
};

type BlogSection = {
  /** 1 = 大标题，2 = 小标题 */
  level: 1 | 2;
  heading: string;
  paragraphs?: string[];
};

type BlogPost = {
  id: string;
  title: string;
  date: string;
  sections: BlogSection[];
  /** 配图开关：目前仅企业级 DevOps 架构一图 */
  figure?: 'devops-architecture';
};

const terminalIcon = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
    <rect width="160" height="120" rx="22" fill="#111827"/>
    <rect x="18" y="20" width="124" height="80" rx="12" fill="#0f172a" stroke="#334155" stroke-width="4"/>
    <path d="m38 46 18 14-18 14" fill="none" stroke="#00add8" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>
    <path d="M68 74h36" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="8"/>
  </svg>
`)}`;

const bookIcon = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120">
    <rect width="160" height="120" rx="22" fill="#0b4ea2"/>
    <path d="M24 31c20-8 39-5 56 8v58c-17-12-36-15-56-7V31Z" fill="#fff" stroke="#dbeafe" stroke-width="4"/>
    <path d="M136 31c-20-8-39-5-56 8v58c17-12 36-15 56-7V31Z" fill="#fff" stroke="#dbeafe" stroke-width="4"/>
    <path d="M80 39v58" fill="none" stroke="#0b4ea2" stroke-linecap="round" stroke-width="5"/>
    <path d="M37 48c12-3 25-2 36 4M37 62c12-3 25-2 36 4M123 48c-12-3-25-2-36 4M123 62c-12-3-25-2-36 4" fill="none" stroke="#60a5fa" stroke-linecap="round" stroke-width="4"/>
  </svg>
`)}`;

const coffeeIcon = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <path d="M28 45h64v30c0 17.7-14.3 32-32 32S28 92.7 28 75V45Z" fill="#8b4513"/>
    <path d="M92 53h7c9.4 0 17 7.6 17 17s-7.6 17-17 17h-9" fill="none" stroke="#8b4513" stroke-linecap="round" stroke-width="8"/>
    <path d="M28 45h64" stroke="#5c2f16" stroke-linecap="round" stroke-width="8"/>
    <path d="M38 31c0-6 7-6 7-12M59 31c0-6 7-6 7-12M80 31c0-6 7-6 7-12" fill="none" stroke="#c97a40" stroke-linecap="round" stroke-width="6"/>
    <path d="M22 108h84" stroke="#5c2f16" stroke-linecap="round" stroke-width="8"/>
  </svg>
`)}`;

const zedIcon = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="24" fill="#111827"/>
    <path d="M28 34h72L28 94h72" fill="none" stroke="#67e8f9" stroke-linecap="round" stroke-linejoin="round" stroke-width="12"/>
  </svg>
`)}`;

const openAiIcon = '/gpt.png';

const languages: Language[] = [
  {
    name: 'Golang',
    icon: 'https://cdn.simpleicons.org/go/00ADD8',
    description: '用于构建稳定的后端服务、API，以及高并发系统。',
  },
  {
    name: 'Python',
    icon: 'https://cdn.simpleicons.org/python/3776AB',
    description: '用于脚本编写、自动化、数据处理和快速原型开发。',
  },
  {
    name: 'Java',
    icon: coffeeIcon,
    description: '成熟、强类型的语言生态，适合构建稳定可靠的应用服务。',
  },
  {
    name: 'Kotlin',
    icon: 'https://cdn.simpleicons.org/kotlin/7F52FF',
    description: '简洁现代的 JVM 语言，帮助编写清晰且易维护的应用程序。',
  },
  {
    name: 'TypeScript',
    icon: 'https://cdn.simpleicons.org/typescript/3178C6',
    description: '为 JavaScript 增加类型安全，适用于前端和全栈产品开发。',
  },
  {
    name: 'MySQL',
    icon: 'https://cdn.simpleicons.org/mysql/4479A1',
    description: '用于结构化数据存储、事务处理和可靠的数据查询。',
  },
  {
    name: 'Redis',
    icon: 'https://cdn.simpleicons.org/redis/DC382D',
    description: '基于内存的数据存储，适合缓存、队列、会话和快速检索。',
  },
  {
    name: 'Linux',
    icon: 'https://cdn.simpleicons.org/linux/FCC624',
    description: '开源操作系统环境，常用于服务部署、开发和系统管理。',
  },
  {
    name: 'Kubernetes',
    icon: 'https://cdn.simpleicons.org/kubernetes/326CE5',
    description: '用于容器编排、服务部署、扩缩容和集群管理。',
  },
  {
    name: 'Docker',
    icon: 'https://cdn.simpleicons.org/docker/2496ED',
    description: '用于打包、运行和分发一致的开发与生产环境。',
  },
  {
    name: 'Zed',
    icon: zedIcon,
    description: '轻量、快速的代码编辑器，适合高效编写和浏览代码。',
  },
  {
    name: 'Claude',
    icon: 'https://cdn.simpleicons.org/claude/D97757',
    description: '用于辅助思考、代码分析、内容整理和开发协作。',
  },
  {
    name: 'Codex',
    icon: openAiIcon,
    description: '用于代码生成、修改、调试和自动化开发工作流。',
  },
  {
    name: 'DeepSeek',
    icon: 'https://cdn.simpleicons.org/deepseek/4D6BFE',
    description: '用于代码问答、推理分析和技术问题探索。',
  },
];

const bandImage = '/band.jpg';

const favoriteBands: BandEntry[] = [
  {
    name: 'Chilichill',
    image: '/cc1.jpg',
    images: ['/cc1.jpg', '/cc2.jpg'],
    description: '由YuH.和Cu夏2人组成的独立音乐团体，2020年3月组建。Chili是辣椒，而形近词Chil有放松的意思，一个又可意会不可言传的词语组合。ChiliChil希望自己的音乐可以在极端的情绪宣泄和自暴自弃似的无所谓中找到些平衡，嬉笑怒骂都是生活。我们生产我们觉得好听的一-人唱的、V家的、没有人唱的一-音乐。',
  },
  {
    name: 'Mrs. GREEN APPLE',
    image: '/apple.jpg',
    description: 'Mrs. GREEN APPLE（ミセス・グリーン・アップル），日本摇滚乐队，由主唱及词曲创作者大森元贵、吉他手若井滉斗和键盘手藤泽凉架组成。隶属于环球音乐旗下的百代唱片公司。旋律明亮而充满能量，在流行摇滚中融入丰富层次，适合反复聆听。',
  },
  {
    name: 'sakanaction',
    image: '/yy.jpg',
    description: '鱼韵乐队(サカナクション、Sakanaction)，日本的摇滚乐队，于2005年在北海道札幌市结成，是以兼任主音以及吉他的山口一郎为中心组成的3男2女乐队。乐风综合了另类摇滚、电子音乐、新浪潮、Pop等等，很难将其归类为其中之一。',
    objectPosition: 'center 20%',
  },
  {
    name: 'Onerepublic',
    image: '/public1.jpg',
    images: ['/public1.jpg', '/public2.png'],
    description: '站在科罗拉多州星空下的音乐追梦者们，用pop-rock/indie/alternative融合曲风俘获全球乐迷的心。这支名为OneRepublic的音乐军团自2004年组建伊始，便在主唱RyanTedder近乎偏执的音乐追求中成长--这位五岁便与钢琴结缘的音乐天才，始终秉持着"用旋律缔造灵魂共鸣"的创作信念，将乐队锻造成兼具艺术深度与流行触觉的独特存在。',
  },
];

const myBands: BandEntry[] = [
  {
    name: '',
    image: '/BAND-ONE.jpg',
    description: '',
    objectPosition: 'center 20%',
  },
  {
    name: '九刻钟乐队',
    image: '/BAND-TWO.jpg',
    description: '这里记录我们的照片、正在创作的声音，以及我们想一起表达的故事。',
    objectPosition: 'center center',
  },
];

// 每新增一篇文章，就在这里追加一个对象；sections 用 level 1/2 区分大标题与小标题，月份会根据 date 自动归类。
const blogPosts: BlogPost[] = [
  {
    id: 'im-project',
    title: 'im项目',
    date: '2026-09-11',
    sections: [
      {
        level: 1,
        heading: '总体分层',
        paragraphs: [
          '我的 IM 系统分为接入层、网关路由层和异步存储层，同时支持 WebSocket 和 gnet TCP 两种长连接协议。',
        ],
      },
      {
        level: 1,
        heading: '连接与认证',
        paragraphs: [
          '首先是连接认证。WebSocket 在 HTTP 升级为 WebSocket 之前，从查询参数中读取 JWT，校验签名和有效期，并从 Claims 中取得 UID。gnet TCP 在连接建立后要求第一帧必须是 CmdLogin，JWT 放在 Content 字段中，验证失败就关闭连接。',
          '认证成功后，网关创建 Client 对象，在本地 Hub 中维护 UID → Client 映射。Client 通过 Transport 接口屏蔽 WebSocket 和 TCP 的差异，Router 只面向 Client 发送消息。服务端处理消息时会用认证连接中的 UID 强制覆盖客户端传入的 From 字段，防止用户伪造发送者身份。',
        ],
      },
      {
        level: 1,
        heading: '协议与帧格式',
        paragraphs: [
          'WebSocket 本身具有消息边界，服务端读取二进制消息后直接进行 Protobuf 反序列化；TCP 没有消息边界，因此我设计了“4 字节大端长度前缀加 Protobuf 负载”的帧格式。gnet 收到数据后先读取长度，再判断完整负载是否到达，以处理粘包和半包，同时限制最大帧长度。解析完成后，业务任务会提交到工作池，避免阻塞 Reactor 事件循环。',
        ],
      },
      {
        level: 1,
        heading: '去重、校验与限流',
        paragraphs: [
          '消息进入 Router 后，先执行去重检查。客户端为消息生成 seq，去重键是 fromUID:seq，值是服务端第一次处理时分配的 msgID。本地去重缓存默认 TTL 为 5 分钟；启用 Redis 后，还会异步写入 Redis，Redis 中的 TTL 是本地的两倍。发现重复消息时不会再次投递，而是把原来的 msgID 放进 ACK 返回给 A。',
          '去重检查通过后，服务端校验命令范围、目标用户等字段，再通过按 UID 划分的令牌桶进行限流。超过持续速率或突发容量的消息会被拒绝。通过校验和限流后，服务端使用 Snowflake 生成全局唯一的 msgID 和时间戳。',
        ],
      },
      {
        level: 1,
        heading: '跨网关路由',
      },
      {
        level: 2,
        heading: '本地查询与 gRPC 转发',
        paragraphs: [
          '路由时，G1 先查询本地 Hub。由于 B 连接在 G2，G1 本地查不到 B，因此根据 B 的 UID 在一致性哈希环上计算归属网关，再通过 gRPC 调用目标网关的 ForwardMessage。',
        ],
      },
      {
        level: 2,
        heading: '一致性哈希与服务发现',
        paragraphs: [
          '一致性哈希解决的是 UID → 归属网关的稳定分配问题，节点扩缩容时只需要迁移少部分 UID；Redis 服务发现保存的是网关节点 ID 和地址，不是用户的在线位置。各网关通过带 TTL 的心跳注册自身，ClusterManager 发现节点上下线后更新哈希环和 gRPC 连接。',
        ],
      },
      {
        level: 2,
        heading: '在线位置表的缺口',
        paragraphs: [
          '这里有一个实现边界：当前系统各网关只保存本节点的 UID → Client 映射，没有全局的 UID → Gateway 在线位置表。因此要保证准确路由，接入层必须让用户连接到一致性哈希计算出的归属网关；如果 B 实际连接在 G2，但哈希归属是 G3，系统就可能把在线用户误判为离线。生产环境中我会在 Redis 维护带连接版本和 TTL 的在线位置映射，例如 im:online:{uid} → gatewayID:connectionID，并通过心跳续期、Lua 脚本比较 connectionID 后删除，避免旧连接清理掉新连接。',
        ],
      },
      {
        level: 1,
        heading: '在线投递与降级',
        paragraphs: [
          'G2 收到转发请求后查询本地 Hub。如果找到 B，就把消息放入 B 的有界发送队列，再由唯一的 WriteLoop 写入 WebSocket 或 TCP 连接，避免并发写连接。如果发送队列已满，或者 B 已经离线，G2 就把消息转入离线队列。',
          '整体降级链路是：先尝试本地在线投递；本地不存在时，根据一致性哈希通过 gRPC 转发到归属网关；如果哈希环不可用、Forwarder 未配置或者 gRPC 转发失败，则降级到 G1 的本地离线存储。离线存储优先使用 Redis List，通过 Lua 脚本原子完成追加和裁剪；Redis 故障时继续降级到内存队列，但内存队列会在节点宕机后丢失。',
        ],
      },
      {
        level: 1,
        heading: 'ACK 语义与异步持久化',
      },
      {
        level: 2,
        heading: '受理 ACK 的语义',
        paragraphs: [
          '完成在线投递或者离线存储尝试后，如果消息设置了 NeedAck，G1 向 A 返回 CmdAck，其中携带客户端 seq 和服务端 msgID。这个 ACK 只是“网关路由受理 ACK”，表示消息已经进入接收端发送队列，或者已经尝试进入离线队列；它不代表消息已经写入 MySQL，也不代表 B 的应用程序已经收到或读取消息。当前系统实现了发送方受理 ACK 和已读回执，但没有实现严格的接收端送达 ACK。',
        ],
      },
      {
        level: 2,
        heading: '异步落库与职责区分',
        paragraphs: [
          'ACK 之后，消息被提交到容量有限的异步持久化队列，由固定数量的 worker 处理。启用 Kafka 时，Gateway 将 Protobuf 消息以 msgID 为 Key 写入 Kafka，Logic 服务批量消费并写入 MySQL，落库成功后再提交 Kafka offset。MySQL 以 msgID 作为主键，并使用 INSERT IGNORE 保证重复消费幂等。当前代码如果同时配置 Kafka 和本地 MessageStore，还会并行执行 Kafka 发布和 MySQL 直写，两条路径通过相同 msgID 实现落库幂等。',
          'Kafka 和 MySQL 负责消息历史持久化，离线队列负责用户不在线时等待后续投递，三者职责不同，离线队列不能替代消息历史库。',
        ],
      },
      {
        level: 2,
        heading: '交付保证的边界',
        paragraphs: [
          '对于“已受理消息不丢失”，当前实现不能提供严格保证。因为 ACK 早于 Kafka 和 MySQL 持久化；持久化队列满时可能丢弃任务；Kafka 发布失败只记录日志；Redis 离线存储失败会回退到内存，而节点宕机会丢失内存数据。因此当前更准确的说法是尽力而为的受理和至少一次倾向，而不是 ACK 后绝对不丢失。要实现严格保证，需要先把消息写入 Kafka 或事务型 Outbox 等可靠存储，再向 A 返回受理 ACK。',
        ],
      },
      {
        level: 1,
        heading: '重复与幂等的取舍',
        paragraphs: [
          '最后，如果 G2 已经把消息放入 B 的发送队列，但 G1 在写入 A:seq 去重标记和返回 ACK 之前宕机，A 超时后会使用相同 seq 重试。由于服务端没有找到去重记录，会把它当成新消息，重新生成 msgID 并再次投递，因此 B 可能收到两次。',
          '去重标记放在投递后，是因为系统在重复和丢失之间选择了至少一次投递。如果在投递前先写去重标记，写完后网关宕机或发送队列已满，A 重试时会被去重逻辑拦截，消息可能永久丢失。投递后标记可能产生重复，但重复通常可以通过幂等处理。',
          '不过当前前端只按服务端 msgID 去重，而两次处理会生成不同的 msgID，所以这个宕机窗口内仍可能重复展示。完善方案是让客户端生成稳定的 clientMsgID，重试时保持不变，并在可靠存储中对 fromUID + clientMsgID 建立唯一约束，使重试能够复用原消息状态和服务端 msgID。',
        ],
      },
    ],
  },
  {
    id: 'devops-architecture',
    title: '企业级 DevOps 架构',
    date: '2026-09-12',
    sections: [
      {
        level: 1,
        heading: '目标与原则',
        paragraphs: [
          '企业级 DevOps 的目标不是引入更多工具，而是让每一次代码变更从提交到上线都可预期、可重复、可回滚。整套架构围绕四个原则：单一可信源、一切皆代码、一次构建多环境晋升、最小权限。',
          '整体分为六层：源码与协作、持续集成、制品管理、环境与基础设施、持续部署、可观测与反馈。安全与权限不单独成层，而是横切在所有环节中的约束。',
        ],
      },
      {
        level: 1,
        heading: '源码与协作',
        paragraphs: [
          '源码与协作层以 Git 作为唯一可信源，应用代码、基础设施声明、Kubernetes 清单和流水线定义全部进入仓库。分支策略采用主干开发加短生命周期分支：功能分支以天为单位，经合并请求评审后合入主干；主干受保护，禁止直接推送。',
        ],
      },
      {
        level: 1,
        heading: '持续集成',
        paragraphs: [
          '持续集成层对每次提交和合并请求运行同一套流水线：代码检查、单元测试、静态分析、依赖与密钥扫描、镜像构建。任何一步失败都会阻断合并。流水线定义与代码放在同一个仓库，修改流水线同样需要评审。单次流水线应控制在十分钟以内，否则开发者会想办法绕过它。',
        ],
      },
      {
        level: 1,
        heading: '制品管理',
        paragraphs: [
          '制品层存放构建产物，通常是容器镜像与软件包。规则是“一次构建、多环境晋升”：同一个镜像经过测试后原样进入生产，禁止在不同环境重新构建。镜像使用基于提交号的不可变标签，不使用 latest，并在入库前完成签名与漏洞扫描。',
        ],
      },
      {
        level: 1,
        heading: '环境与基础设施',
      },
      {
        level: 2,
        heading: '环境分级',
        paragraphs: [
          '环境按用途分级：开发、测试、预发、生产。各级使用独立的账号或命名空间，网络与权限相互隔离，生产数据与密钥不复制到低级别环境。资源统一打标签并设置配额，便于成本归属与容量治理。',
        ],
      },
      {
        level: 2,
        heading: '基础设施即代码',
        paragraphs: [
          '环境与基础设施层用声明式代码描述云资源与集群对象，常见组合是用 Terraform 管理云资源、Kubernetes 管理运行时、Helm 或 Kustomize 管理应用清单。环境差异通过参数与叠加层表达，而不是手工修改。任何环境都应能从代码重建，避免无法复现的“雪花服务器”。',
        ],
      },
      {
        level: 1,
        heading: '持续部署',
      },
      {
        level: 2,
        heading: 'GitOps 收敛',
        paragraphs: [
          '持续部署层采用 GitOps：部署清单以配置仓库为唯一来源，集群内的代理持续比对期望状态与实际状态并自动收敛，常见实现是 Argo CD 或 Flux。发布按环境逐级晋升，开发与测试自动部署，预发与生产需要审批。每次部署都记录版本、提交号、执行人与时间，形成审计链。',
        ],
      },
      {
        level: 2,
        heading: '发布策略',
        paragraphs: [
          '发布策略按风险选择：无状态服务默认滚动更新；核心服务使用金丝雀发布，先导入少量流量观察错误率和延迟，再逐步扩大；对一致性要求高或跨版本兼容困难的场景使用蓝绿发布。',
        ],
      },
      {
        level: 2,
        heading: '数据库变更',
        paragraphs: [
          '数据库变更与代码发布解耦，遵循“先扩展、后迁移、再收缩”：先增加兼容字段，双写并迁移数据，确认无误后再删除旧结构。只有这样新旧版本才能同时运行，回滚才不会被数据结构卡住。',
        ],
      },
      {
        level: 1,
        heading: '配置与密钥',
        paragraphs: [
          '配置与密钥管理遵循“仓库里没有秘密”。普通配置按环境注入，敏感信息存放在集中式密钥管理系统，由工作负载在运行时拉取，并支持轮换与吊销。密钥一旦进入提交历史就视为泄露，必须立即轮换，而不是只删除文件。',
        ],
      },
      {
        level: 1,
        heading: '可观测性',
      },
      {
        level: 2,
        heading: '三类数据',
        paragraphs: [
          '可观测层统一采集指标、日志和链路追踪，三者使用一致的服务名、版本与环境标签。指标用于告警和容量规划，日志用于定位具体事件，链路用于分析跨服务延迟。常用组合是 Prometheus 加 Grafana、Loki 或 ELK、OpenTelemetry。',
        ],
      },
      {
        level: 2,
        heading: '告警',
        paragraphs: [
          '告警只保留可行动项，每条告警对应明确的分级与处理手册。',
        ],
      },
      {
        level: 1,
        heading: '安全与合规',
        paragraphs: [
          '安全以 DevSecOps 的方式嵌入流水线：依赖扫描、镜像扫描、密钥扫描、静态与动态分析按阶段执行，高危问题直接阻断发布。权限遵循最小化原则，人与流水线使用不同的身份，生产操作全部留痕；紧急通道单独授权，事后必须审计。供应链侧还需要生成 SBOM 并对制品签名。',
        ],
      },
      {
        level: 1,
        heading: '回滚与故障处理',
      },
      {
        level: 2,
        heading: '回滚',
        paragraphs: [
          '回滚不是例外流程，而是默认能力。镜像不可变与数据库向后兼容是一键回滚的前提。每次发布前都应验证回滚路径，而不是等故障发生时才发现回不去。',
        ],
      },
      {
        level: 2,
        heading: '故障响应',
        paragraphs: [
          '故障处理先止损、再定位：优先恢复服务，其次分析根因。复盘关注流程与自动化缺口，把结论落实为新的检查项或监控项，而不是依赖个人记忆。',
        ],
      },
      {
        level: 1,
        heading: '度量与改进',
        paragraphs: [
          '度量体系使用四个指标：部署频率、变更前置时间、变更失败率、故障恢复时间。它们反映的是流程瓶颈，而不是团队人数；此外还应关注流水线时长与回滚率。',
        ],
      },
      {
        level: 1,
        heading: '误区与边界',
      },
      {
        level: 2,
        heading: '常见误区',
        paragraphs: [
          '常见误区是把 DevOps 等同于一条部署流水线。流水线只是其中一环，真正的差距在环境一致性、制品不可变、密钥治理和回滚能力。另一个误区是追求全自动却忽略审批边界：生产变更的授权、审计与合规要求必须显式设计，不能依赖默认行为。',
        ],
      },
      {
        level: 2,
        heading: '能力边界',
        paragraphs: [
          '最后需要明确边界：这套架构不能消除故障，只能缩小影响范围、缩短恢复时间。灰度、限流、熔断和回滚是配套的运行时能力，缺少其中任何一项，自动化发布都会放大风险。',
        ],
      },
    ],
    figure: 'devops-architecture',
  },
];

function formatBlogMonth(date: string) {
  const [year, month] = date.split('-');
  return `${year.slice(-2)}年${Number(month)}月`;
}

function formatBlogDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}

type DragState = {
  dragging: boolean;
  pointerId: number | null;
  sx: number;
  sy: number;
  ox: number;
  oy: number;
  cx: number;
  cy: number;
};

const backgroundImage = '/qq9.png';

const projects: Project[] = [
  {
    id: 1,
    title: '语言 & 工具',
    anchorX: 24,
    anchorY: 30,
    thumbnail: terminalIcon,
    view: 'languages',
  },
  {
    id: 2,
    title: 'BLOG',
    anchorX: 76,
    anchorY: 30,
    thumbnail: bookIcon,
    view: 'blogs',
  },
  {
    id: 3,
    title: '音乐',
    anchorX: 24,
    anchorY: 63,
    thumbnail: bandImage,
    view: 'bands',
  },
  {
    id: 4,
    title: '致谢',
    anchorX: 76,
    anchorY: 63,
    thumbnail:
      '/Friend.jpg',
    view: 'thanks',
  },
  {
    id: 5,
    title: '莫比乌斯环',
    anchorX: 50,
    anchorY: 47,
    thumbnail:
      '/infinity-particle-pixel-transparent.gif',
  },
];

const dockAssets = {
  about: '/Wx1.jpg',
  github: 'https://github.githubassets.com/favicons/favicon.svg',
};

const fonts = {
  body: "'Inter', sans-serif",
  display: "'Inter Display', 'Inter', sans-serif",
};

const mobileCardAnchors: Record<number, Position> = {
  1: { x: 25, y: 23 },
  2: { x: 75, y: 23 },
  3: { x: 25, y: 50 },
  4: { x: 75, y: 50 },
  5: { x: 50, y: 73 },
};

function useIsCompactViewport() {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth <= 680,
  );

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth <= 680);
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isCompact;
}

function useDraggable() {
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const positionRef = useRef<Position>({ x: 0, y: 0 });
  const dragState = useRef<DragState>({
    dragging: false,
    pointerId: null,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
    cx: 0,
    cy: 0,
  });
  const isDraggingRef = useRef(false);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    event.preventDefault();
    const state = dragState.current;
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.sx = event.clientX;
    state.sy = event.clientY;
    state.ox = positionRef.current.x;
    state.oy = positionRef.current.y;
    state.cx = event.clientX;
    state.cy = event.clientY;
    isDraggingRef.current = false;

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is not available in a few older mobile browsers.
    }

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      const current = dragState.current;
      if (!current.dragging || moveEvent.pointerId !== current.pointerId) return;

      current.cx = moveEvent.clientX;
      current.cy = moveEvent.clientY;
      const dx = current.cx - current.sx;
      const dy = current.cy - current.sy;

      if (Math.hypot(dx, dy) >= 5) {
        isDraggingRef.current = true;
      }

      const nextPosition = { x: current.ox + dx, y: current.oy + dy };
      positionRef.current = nextPosition;
      setPos(nextPosition);
    };

    const handleEnd = (endEvent: globalThis.PointerEvent) => {
      if (endEvent.pointerId !== dragState.current.pointerId) return;
      dragState.current.dragging = false;
      dragState.current.pointerId = null;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
  }, []);

  return { pos, onPointerDown, isDraggingRef };
}

function ProjectCard({
  project,
  onOpen,
  compact,
}: {
  project: Project;
  onOpen: (project: Project) => void;
  compact: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { pos, onPointerDown, isDraggingRef } = useDraggable();
  const anchor = compact
    ? mobileCardAnchors[project.id] ?? { x: project.anchorX, y: project.anchorY }
    : { x: project.anchorX, y: project.anchorY };

  const handleClick = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      return;
    }

    onOpen(project);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(project);
    }
  };

  const cardStyle: CSSProperties = {
    position: 'absolute',
    left: `calc(${anchor.x}% - 52px)`,
    top: `calc(${anchor.y}% - 64px)`,
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    zIndex: 2,
    cursor: 'grab',
    userSelect: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    touchAction: 'none',
  };

  const wrapperStyle: CSSProperties = {
    padding: compact ? 8 : 12,
    borderRadius: 8,
    border: `2px solid ${hovered ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
    background: hovered ? 'rgba(0,0,0,0.16)' : 'transparent',
    transition: 'background 0.18s ease, border-color 0.18s ease',
  };

  const titleStyle: CSSProperties = {
    background: hovered ? 'rgb(0,102,221)' : 'transparent',
    padding: hovered ? '4px 8px' : '4px 0',
    borderRadius: 4,
    transition: 'background 0.18s ease, padding 0.18s ease',
    fontFamily: fonts.body,
    fontWeight: 400,
    fontSize: compact ? 14 : 16,
    lineHeight: '1.4em',
    letterSpacing: '-0.04em',
    color: 'rgb(247,247,247)',
    whiteSpace: 'nowrap',
  };

  return (
    <div
      style={cardStyle}
      role="button"
      tabIndex={0}
      aria-label={`Open project ${project.title}`}
      onPointerDown={onPointerDown}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onContextMenu={(event) => event.preventDefault()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div style={wrapperStyle}>
        <img
          src={project.thumbnail}
          alt=""
          draggable={false}
          style={{
            display: 'block',
            width: compact ? 68 : 80,
            height: compact ? 51 : 60,
            objectFit: 'cover',
            objectPosition: project.id === 3 ? 'center top' : 'center',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0px 1px 6px 0px rgba(0,0,0,0.08)',
          }}
        />
      </div>
      <div style={titleStyle}>{project.title}</div>
    </div>
  );
}

type WindowShellProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  height?: string;
};

function WindowShell({ title, onClose, children, wide = false, height }: WindowShellProps) {
  const [visible, setVisible] = useState(false);
  const [windowPosition, setWindowPosition] = useState<Position>({ x: 0, y: 0 });
  const [windowDragging, setWindowDragging] = useState(false);
  const compact = useIsCompactViewport();
  const windowDragState = useRef({
    dragging: false,
    pointerId: null as number | null,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
  });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleTitlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();

    const state = windowDragState.current;
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.sx = event.clientX;
    state.sy = event.clientY;
    state.ox = windowPosition.x;
    state.oy = windowPosition.y;
    setWindowDragging(true);

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is not available in a few older mobile browsers.
    }

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      const current = windowDragState.current;
      if (!current.dragging || moveEvent.pointerId !== current.pointerId) return;
      setWindowPosition({
        x: current.ox + moveEvent.clientX - current.sx,
        y: current.oy + moveEvent.clientY - current.sy,
      });
    };

    const handleEnd = (endEvent: globalThis.PointerEvent) => {
      if (endEvent.pointerId !== windowDragState.current.pointerId) return;
      windowDragState.current.dragging = false;
      windowDragState.current.pointerId = null;
      setWindowDragging(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
  };

  const panelStyle: CSSProperties = {
    width: compact ? '100%' : wide ? '70vw' : '60vw',
    maxWidth: compact ? 'none' : wide ? 840 : 720,
    height,
    maxHeight: compact ? 'calc(100dvh - 24px)' : height ?? '70vh',
    borderRadius: compact ? 18 : 24,
    background: 'white',
    boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
    pointerEvents: 'all',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transform: `translate(${windowPosition.x}px, ${windowPosition.y}px) scale(${visible ? 1 : 0.8})`,
    opacity: visible ? 1 : 0,
    transition: windowDragging
      ? 'none'
      : 'transform 0.4s cubic-bezier(0.34,1.28,0.64,1), opacity 0.3s ease',
  };

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? 12 : 0,
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <section style={panelStyle} role="dialog" aria-modal="true" aria-label={title}>
        <div
          style={{
            height: 40,
            minHeight: 40,
            padding: '0 16px',
            borderBottom: '1px solid rgb(229,229,234)',
            cursor: windowDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            touchAction: 'none',
          }}
          onPointerDown={handleTitlePointerDown}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrafficLight color="rgb(253,93,92)" label="Close window" onClick={onClose} />
            <TrafficLight color="rgb(250,201,0)" label="Close window" onClick={onClose} />
            <TrafficLight color="rgb(52,199,90)" label="Close window" onClick={onClose} />
          </div>
          <div
            style={{
              fontFamily: fonts.body,
              fontWeight: 400,
              fontSize: 16,
              color: 'rgb(134,134,139)',
              letterSpacing: '-0.04em',
              flex: 1,
              textAlign: 'center',
              paddingRight: 66,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: compact ? 12 : 16,
            gap: compact ? 12 : 16,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </section>
    </div>
  );
}

function TrafficLight({ color, label, onClick }: { color: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      style={{
        width: 12,
        height: 12,
        padding: 0,
        border: 0,
        borderRadius: '50%',
        background: color,
        cursor: 'pointer',
      }}
    />
  );
}

type DockIconProps = {
  label: string;
  image: string;
  onClick?: () => void;
  href?: string;
};

function DockIcon({ label, image, onClick, href }: DockIconProps) {
  const [hovered, setHovered] = useState(false);
  const Tag = href ? 'a' : 'button';

  const iconStyle: CSSProperties = {
    display: 'block',
    width: 48,
    height: 48,
    padding: 0,
    border: 0,
    borderRadius: '28%',
    overflow: 'hidden',
    background: 'transparent',
    cursor: 'pointer',
    transform: hovered ? 'scale(1.12)' : 'scale(1)',
    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
    textDecoration: 'none',
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: hovered ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.15s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <div
          style={{
            padding: '6px 12px',
            borderRadius: 64,
            background: 'white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            fontFamily: fonts.body,
            fontWeight: 500,
            fontSize: 12,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: 'black',
          }}
        >
          {label}
        </div>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid white',
          }}
        />
      </div>
      <Tag
        {...(href ? { href, target: '_blank', rel: 'noreferrer' } : { type: 'button', onClick })}
        aria-label={label}
        style={iconStyle}
      >
        <img
          src={image}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </Tag>
    </div>
  );
}

function LanguagesWindow({ onClose }: { onClose: () => void }) {
  return (
    <WindowShell title="语言 & 工具" wide height="60vh" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 30,
            lineHeight: 1,
            letterSpacing: '-0.06em',
            color: 'rgb(20,20,22)',
          }}
        >
          我会使用的语言与工具
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 400,
            fontSize: 14,
            lineHeight: 1.5,
            letterSpacing: '-0.02em',
            color: 'rgb(134,134,139)',
          }}
        >
          用于构建可靠产品、清晰界面和实用系统的一组技术栈。
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {languages.map((language) => (
          <article
            key={language.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: 14,
              border: '1px solid rgb(229,229,234)',
              borderRadius: 16,
              background: 'rgb(250,250,252)',
            }}
          >
            <div
              style={{
                flex: '0 0 auto',
                width: 52,
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                background: 'white',
                border: '1px solid rgb(229,229,234)',
              }}
            >
              <img
                src={language.icon}
                alt={`${language.name} 图标`}
                style={{ width: 32, height: 32, objectFit: 'contain', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  fontSize: 17,
                  lineHeight: 1.2,
                  letterSpacing: '-0.04em',
                  color: 'rgb(35,35,38)',
                }}
              >
                {language.name}
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontWeight: 400,
                  fontSize: 13,
                  lineHeight: 1.45,
                  letterSpacing: '-0.015em',
                  color: 'rgb(110,110,115)',
                }}
              >
                {language.description}
              </div>
            </div>
          </article>
        ))}
      </div>
    </WindowShell>
  );
}

function BlogHeading({ level, text, compact }: { level: 1 | 2; text: string; compact: boolean }) {
  const style: CSSProperties = {
    margin: 0,
    fontFamily: fonts.display,
    fontWeight: 600,
    fontSize: level === 1 ? (compact ? 20 : 23) : compact ? 16 : 17,
    lineHeight: 1.3,
    letterSpacing: level === 1 ? '-0.05em' : '-0.03em',
    color: level === 1 ? 'rgb(20,20,22)' : 'rgb(48,48,52)',
  };

  return level === 1 ? <h2 style={style}>{text}</h2> : <h3 style={style}>{text}</h3>;
}

function BlogParagraph({ text, compact }: { text: string; compact: boolean }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: fonts.body,
        fontWeight: 400,
        fontSize: compact ? 15 : 16,
        lineHeight: 1.85,
        letterSpacing: '-0.025em',
        color: 'rgb(55,55,59)',
        overflowWrap: 'anywhere',
      }}
    >
      {text}
    </p>
  );
}

type DiagramNode = {
  kind: 'source' | 'stage' | 'brief';
  tag?: string;
  title: string;
  lines?: string[];
};

const devopsDiagramNodes: DiagramNode[] = [
  { kind: 'source', title: '开发者  →  合并请求 (MR)' },
  {
    kind: 'stage',
    tag: '01',
    title: '源码与协作 · Git = 唯一可信源',
    lines: [
      '应用代码 / 基础设施声明 / K8s 清单 / 流水线定义',
      '主干保护 · 短生命周期分支 · 合并请求评审',
    ],
  },
  {
    kind: 'stage',
    tag: '02',
    title: '持续集成 · 失败即阻断合并（目标 < 10 分钟）',
    lines: [
      '代码检查 → 单元测试 → 静态分析 → 依赖与密钥扫描 → 镜像构建',
      '流水线定义与代码同仓库，修改流水线同样要评审',
    ],
  },
  {
    kind: 'stage',
    tag: '03',
    title: '制品管理 · 一次构建，多环境晋升',
    lines: ['不可变标签 (commit sha) · 制品签名 · 漏洞扫描', '禁止 latest，禁止按环境重新构建'],
  },
  {
    kind: 'stage',
    tag: '04',
    title: '环境与基础设施 · 声明式重建，拒绝雪花服务器',
    lines: [
      '开发 → 测试 → 预发 → 生产（账号 / 命名空间 / 网络 / 权限隔离）',
      'Terraform + Kubernetes + Helm / Kustomize · 密钥 Vault / KMS 运行时注入',
    ],
  },
  {
    kind: 'stage',
    tag: '05',
    title: '持续部署 (GitOps) · 配置仓库 = 期望状态',
    lines: [
      'Argo CD / Flux 持续比对并收敛 · 自动：开发 / 测试 · 审批：预发 / 生产',
      '发布策略：滚动 / 金丝雀 / 蓝绿 · 数据库：先扩展 → 后迁移 → 再收缩',
    ],
  },
  {
    kind: 'stage',
    tag: '06',
    title: '可观测与反馈 · 统一 service / version / env 标签',
    lines: [
      '指标 Prometheus + Grafana · 日志 Loki / ELK · 链路 OpenTelemetry',
      '告警 = 可行动项 + 分级 + 处理手册',
    ],
  },
  {
    kind: 'brief',
    tag: '07',
    title: '反馈闭环',
    lines: ['告警 / 复盘结论 → 新的检查项、监控项、告警规则 → 回到 01 / 02'],
  },
];

const devopsDiagramArrows = [
  '提交 / 评审',
  '触发',
  '产出（一次构建）',
  '晋升（同一个 digest）',
  '部署（同一制品）',
  '运行',
  '告警 / 复盘结论',
];

function DevOpsArchitectureDiagram({ compact }: { compact: boolean }) {
  const boxX = 36;
  const boxW = 620;
  const railX = 700;
  const padTop = 18;
  const gap = 40;
  const heights = devopsDiagramNodes.map((node) =>
    node.kind === 'stage' ? 86 : node.kind === 'brief' ? 68 : 48,
  );

  const tops: number[] = [];
  let cursor = padTop;
  for (const height of heights) {
    tops.push(cursor);
    cursor += height + gap;
  }

  const bandY = cursor + 6;
  const bandH = 96;
  const viewH = bandY + bandH + padTop;
  const centers = tops.map((top, index) => top + heights[index] / 2);
  const railMidY = (centers[1] + centers[centers.length - 1]) / 2;
  const feedback = [
    `M ${boxX + boxW} ${centers[centers.length - 1]}`,
    `H ${railX}`,
    `V ${centers[1]}`,
    `H ${boxX + boxW}`,
  ].join(' ');

  return (
    <div
      style={{
        minWidth: 0,
        maxWidth: '100%',
        padding: compact ? 10 : 14,
        border: '1px solid rgb(229,229,234)',
        borderRadius: 16,
        background: 'white',
        overflowX: 'auto',
      }}
    >
      <svg
        role="img"
        aria-label="企业级 DevOps 架构图：从提交、集成、制品、环境、部署到可观测的完整链路，以及回到源码与流水线的反馈闭环"
        viewBox={`0 0 760 ${viewH}`}
        style={{ display: 'block', width: '100%', minWidth: 620, maxWidth: 760, height: 'auto' }}
      >
        <defs>
          <marker
            id="devops-flow-arrow"
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 Z" fill="rgb(172,172,180)" />
          </marker>
        </defs>

        {devopsDiagramNodes.map((node, index) => {
          const top = tops[index];
          const height = heights[index];
          const filled = node.kind === 'stage';

          return (
            <g key={node.tag ?? node.kind}>
              <rect
                x={boxX}
                y={top}
                width={boxW}
                height={height}
                rx={14}
                fill={filled ? 'white' : 'rgb(250,250,252)'}
                stroke="rgb(229,229,234)"
                strokeDasharray={filled ? undefined : '4 4'}
              />
              {node.tag ? (
                <>
                  <rect x={boxX + 18} y={top + 18} width={30} height={22} rx={7} fill="rgb(240,240,244)" />
                  <text
                    x={boxX + 33}
                    y={top + 33}
                    textAnchor="middle"
                    fontFamily={fonts.body}
                    fontSize={11.5}
                    fontWeight={600}
                    fill="rgb(96,96,102)"
                  >
                    {node.tag}
                  </text>
                </>
              ) : null}
              {node.kind === 'source' ? (
                <text
                  x={boxX + boxW / 2}
                  y={top + height / 2 + 5}
                  textAnchor="middle"
                  fontFamily={fonts.body}
                  fontSize={15}
                  fontWeight={600}
                  fill="rgb(20,20,22)"
                >
                  {node.title}
                </text>
              ) : (
                <text x={boxX + 62} y={top + 33} fontFamily={fonts.body} fontSize={15.5} fontWeight={600} fill="rgb(20,20,22)">
                  {node.title}
                </text>
              )}
              {node.lines?.map((line, lineIndex) => (
                <text
                  key={line}
                  x={boxX + 62}
                  y={top + 56 + lineIndex * 19}
                  fontFamily={fonts.body}
                  fontSize={12.5}
                  fill="rgb(118,118,124)"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}

        {devopsDiagramArrows.map((label, index) => {
          const fromY = tops[index] + heights[index];
          const toY = tops[index + 1];

          return (
            <g key={label}>
              <line
                x1={boxX + boxW / 2}
                y1={fromY + 4}
                x2={boxX + boxW / 2}
                y2={toY - 6}
                stroke="rgb(172,172,180)"
                strokeWidth={1.4}
                markerEnd="url(#devops-flow-arrow)"
              />
              <text
                x={boxX + boxW / 2 + 12}
                y={(fromY + toY) / 2 + 4}
                fontFamily={fonts.body}
                fontSize={11.5}
                fill="rgb(134,134,139)"
              >
                {label}
              </text>
            </g>
          );
        })}

        <path
          d={feedback}
          fill="none"
          stroke="rgb(198,198,206)"
          strokeWidth={1.4}
          strokeDasharray="5 5"
          markerEnd="url(#devops-flow-arrow)"
        />
        <text
          x={railX + 14}
          y={railMidY}
          fontFamily={fonts.body}
          fontSize={11.5}
          fill="rgb(150,150,158)"
          textAnchor="middle"
          transform={`rotate(90 ${railX + 14} ${railMidY})`}
        >
          反馈闭环
        </text>

        <rect
          x={boxX}
          y={bandY}
          width={boxW}
          height={bandH}
          rx={14}
          fill="rgb(249,249,251)"
          stroke="rgb(229,229,234)"
          strokeDasharray="4 4"
        />
        <text x={boxX + 22} y={bandY + 30} fontFamily={fonts.body} fontSize={13.5} fontWeight={600} fill="rgb(20,20,22)">
          横切 · 安全与合规 (DevSecOps)
        </text>
        <text x={boxX + 22} y={bandY + 51} fontFamily={fonts.body} fontSize={12.5} fill="rgb(118,118,124)">
          最小权限 · 人与流水线身份隔离 · 生产操作全量审计 · 紧急通道单独授权 · SBOM + 制品签名
        </text>
        <text x={boxX + 22} y={bandY + 76} fontFamily={fonts.body} fontSize={13.5} fontWeight={600} fill="rgb(20,20,22)">
          回滚 · 镜像不可变 + 数据库向后兼容 = 一键回滚（GitOps revert）
        </text>
      </svg>
    </div>
  );
}

function sectionSpacing(level: 1 | 2, index: number, compact: boolean) {
  if (index === 0) return 0;
  if (level === 1) return compact ? 24 : 32;
  return compact ? 12 : 18;
}

function BlogPostWindow({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const compact = useIsCompactViewport();

  return (
    <WindowShell title={post.title} wide height="78vh" onClose={onClose}>
      <article style={{ display: 'flex', flexDirection: 'column', gap: compact ? 16 : 20 }}>
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 500,
            fontSize: 13,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'rgb(134,134,139)',
          }}
        >
          {formatBlogDate(post.date)}
        </div>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 34,
            lineHeight: 1.05,
            letterSpacing: '-0.06em',
            color: 'rgb(20,20,22)',
          }}
        >
          {post.title}
        </div>
        <div style={{ height: 1, background: 'rgb(229,229,234)' }} />
        {post.figure === 'devops-architecture' ? <DevOpsArchitectureDiagram compact={compact} /> : null}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {post.sections.map((section, sectionIndex) => (
            <section
              key={`${post.id}-${sectionIndex}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                marginTop: sectionSpacing(section.level, sectionIndex, compact),
              }}
            >
              <BlogHeading level={section.level} text={section.heading} compact={compact} />
              {section.paragraphs?.map((paragraph, paragraphIndex) => (
                <BlogParagraph
                  key={`${post.id}-${sectionIndex}-${paragraphIndex}`}
                  text={paragraph}
                  compact={compact}
                />
              ))}
            </section>
          ))}
        </div>
      </article>
    </WindowShell>
  );
}

function BlogsWindow({ onClose }: { onClose: () => void }) {
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);
  const compact = useIsCompactViewport();
  const postsByMonth = blogPosts.reduce<Record<string, BlogPost[]>>((groups, post) => {
    const month = formatBlogMonth(post.date);
    groups[month] = groups[month] ? [...groups[month], post] : [post];
    return groups;
  }, {});

  return (
    <>
      <WindowShell title="BLOG" wide height="78vh" onClose={onClose}>
        <div
          style={{
            width: '100%',
            height: compact ? 'clamp(160px, 46vw, 220px)' : 'clamp(220px, 30vw, 300px)',
            padding: 0,
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgb(247,247,249) 0%, rgb(226,232,240) 100%)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Inter Display', 'Inter', Georgia, serif",
              fontWeight: 600,
              fontStyle: 'italic',
              fontSize: compact ? 'clamp(64px, 22vw, 112px)' : 'clamp(96px, 20vw, 220px)',
              lineHeight: 1,
              letterSpacing: '-0.12em',
              color: 'rgb(20,20,22)',
              textAlign: 'center',
            }}
          >
            BLOG
          </div>
        </div>

        {Object.entries(postsByMonth).map(([month, posts]) => (
          <section key={month} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: 24,
                lineHeight: 1.1,
                letterSpacing: '-0.05em',
                color: 'rgb(20,20,22)',
              }}
            >
              {month}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: compact
                  ? 'repeat(2, minmax(0, 1fr))'
                  : 'repeat(5, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              {posts.map((post, postIndex) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setOpenPost(post)}
                  style={{
                    minHeight: 132,
                    padding: 12,
                    border: '1px solid rgb(229,229,234)',
                    borderRadius: 14,
                    background: 'rgb(250,250,252)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'transform 0.18s ease, background 0.18s ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontWeight: 500,
                      fontSize: 12,
                      lineHeight: 1,
                      color: 'rgb(134,134,139)',
                    }}
                  >
                    {String(postIndex + 1).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter Display', 'Inter', Georgia, serif",
                      fontWeight: 600,
                      fontStyle: 'italic',
                      fontSize: 18,
                      lineHeight: 1.1,
                      letterSpacing: '-0.05em',
                      color: 'rgb(35,35,38)',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {post.title}
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.body,
                      fontWeight: 400,
                      fontSize: 11,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      color: 'rgb(134,134,139)',
                    }}
                  >
                    {formatBlogDate(post.date)}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </WindowShell>

      {openPost ? <BlogPostWindow post={openPost} onClose={() => setOpenPost(null)} /> : null}
    </>
  );
}

function BandImages({ band }: { band: BandEntry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      {(band.images ?? [band.image]).map((image, imageIndex) => (
        <div
          key={`${band.name}-${imageIndex}`}
          style={{
            width: '100%',
            aspectRatio: '16 / 9',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'rgb(239,239,239)',
          }}
        >
          <img
            src={image}
            alt={`${band.name} 图片 ${imageIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: band.objectPosition ?? 'center top',
              display: 'block',
            }}
          />
        </div>
      ))}
    </div>
  );
}

function BandDetails({ band }: { band: BandEntry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, minWidth: 0 }}>
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 17,
          lineHeight: 1.2,
          letterSpacing: '-0.04em',
          color: 'rgb(35,35,38)',
        }}
      >
        {band.name}
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 400,
          fontSize: 13,
          lineHeight: 1.55,
          letterSpacing: '-0.015em',
          color: 'rgb(110,110,115)',
        }}
      >
        {band.description}
      </div>
    </div>
  );
}

function BandSection({
  title,
  entries,
  layout = 'stacked',
}: {
  title: string;
  entries: BandEntry[];
  layout?: 'split' | 'stacked';
}) {
  const compact = useIsCompactViewport();
  const isSplit = layout === 'split' && !compact;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: 24,
          lineHeight: 1.1,
          letterSpacing: '-0.05em',
          color: 'rgb(20,20,22)',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isSplit ? 12 : 0 }}>
        {entries.map((band) =>
          isSplit ? (
            <article
              key={band.name}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
                alignItems: 'center',
                gap: 16,
                padding: 14,
                border: '1px solid rgb(229,229,234)',
                borderRadius: 16,
                background: 'rgb(250,250,252)',
              }}
            >
              <BandImages band={band} />
              <BandDetails band={band} />
            </article>
          ) : (
            <article
              key={band.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 12,
                padding: '14px 0',
              }}
            >
              <div style={{ height: 1, background: 'rgb(229,229,234)' }} />
              <BandImages band={band} />
              <BandDetails band={band} />
              <div style={{ height: 1, background: 'rgb(229,229,234)' }} />
            </article>
          ),
        )}
      </div>
    </section>
  );
}

function BandsWindow({ onClose }: { onClose: () => void }) {
  return (
    <WindowShell title="音乐" wide height="78vh" onClose={onClose}>
      <div
        aria-label="音乐封面"
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          flex: '0 0 auto',
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgb(239,239,239)',
        }}
      >
        <img
          src={bandImage}
          alt="乐队封面"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
          }}
        />
      </div>
      <div
        style={{
          padding: '4px 0',
          fontFamily: "'Inter Display', 'Inter', Georgia, serif",
          fontWeight: 500,
          fontStyle: 'italic',
          fontSize: 24,
          lineHeight: 1.35,
          letterSpacing: '-0.04em',
          color: 'rgb(45,45,48)',
        }}
      >
        音乐是我生命与灵魂的一部分
      </div>
      <div style={{ height: 1, background: 'rgb(229,229,234)' }} />
      <BandSection title="我喜欢的乐队 My favourite Band" entries={favoriteBands} layout="split" />
      <div style={{ height: 1, background: 'rgb(229,229,234)' }} />
      <BandSection title="我的乐队 My Band" entries={myBands} />
    </WindowShell>
  );
}

function ThanksWindow({ project, onClose }: { project: Project; onClose: () => void }) {
  const headingStyle: CSSProperties = {
    fontFamily: fonts.display,
    fontWeight: 600,
    fontStyle: 'italic',
    fontSize: 20,
    lineHeight: 1.25,
    letterSpacing: '-0.04em',
    color: 'rgb(35,35,38)',
  };

  const textStyle: CSSProperties = {
    fontFamily: fonts.body,
    fontWeight: 400,
    fontSize: 16,
    lineHeight: 1.8,
    letterSpacing: '-0.025em',
    color: 'rgb(65,65,70)',
    overflowWrap: 'anywhere',
  };

  return (
    <WindowShell title="致谢" wide height="78vh" onClose={onClose}>
      <div
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgb(239,239,239)',
        }}
      >
        <img
          src={project.thumbnail}
          alt="致谢封面"
          style={{
            width: '100%',
            height: 'clamp(170px, 24vh, 260px)',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={textStyle}>走至今日，熬过了很多焦虑，虽然前路未卜，但仍感谢身边朋友相助。</div>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={headingStyle}>感谢亲爱的</div>
          <div style={textStyle}>夏午、树、须臾；</div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={headingStyle}>感谢我的朋友们 - 排名不分先后，我想到那条打哪条</div>
          <div style={textStyle}>
            Mumuzi、炸酱面有优惠券、无涯、zucci、Jules、Luv7e、Cont1nus3、竹官、VvvVvV、牧孤星、切小块、超吉可口！、Mi Manchi、zjr、Heaven、易喜、生猛野猪林、叶不羞、Raymen
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={headingStyle}>毫不吝啬为我解惑的网友</div>
          <div style={textStyle}>羊肉、01、心外无物、4evour、花岛、午餐肉、白猫...</div>
        </section>
      </div>
    </WindowShell>
  );
}

function ProjectWindow({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <WindowShell title={project.title} wide onClose={onClose}>
      <div
        style={{
          position: 'relative',
          minHeight: 300,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'rgb(239,239,239)',
        }}
      >
        <img
          src={project.thumbnail}
          alt={project.title}
          style={{ width: '100%', height: 'auto', maxHeight: '48vh', objectFit: 'cover', display: 'block' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 28,
            lineHeight: 1.05,
            letterSpacing: '-0.05em',
            color: 'rgb(20,20,22)',
          }}
        >
          {project.title}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 400,
            fontSize: 14,
            lineHeight: 1.5,
            color: 'rgb(110,110,115)',
          }}
        >
          A quiet study in light, texture, and the places where the landscape holds its breath.
        </div>
      </div>
    </WindowShell>
  );
}

function AboutWindow({ onClose }: { onClose: () => void }) {
  return (
    <WindowShell title="About Me" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={dockAssets.about}
            alt=""
            style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 20 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
              style={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: 28,
                lineHeight: 1,
                letterSpacing: '-0.05em',
                color: 'rgb(20,20,22)',
              }}
            >
              641 / 离大谱
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontWeight: 500,
                fontSize: 13,
                letterSpacing: '-0.03em',
                color: 'rgb(134,134,139)',
              }}
            >
              CHINA · GuangZhou
            </div>
          </div>
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 400,
            fontSize: 16,
            lineHeight: 1.55,
            letterSpacing: '-0.025em',
            color: 'rgb(55,55,59)',
          }}
        >
          我是641，一名GO语言开发者，很高兴你能驻足于此看我写的一些小玩意。
        </div>
      </div>
      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background: 'rgb(247,247,249)',
          fontFamily: fonts.body,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: 1.5,
          color: 'rgb(85,85,90)',
        }}
      >
        我的邮箱：2371076392@qq.com
         |  我的微信: 19128726101
      </div>
    </WindowShell>
  );
}

function NotesWindow({ onClose }: { onClose: () => void }) {
  return (
    <WindowShell title="Notes" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          style={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 32,
            lineHeight: 1,
            letterSpacing: '-0.06em',
            color: 'rgb(20,20,22)',
          }}
        >
          Field notes
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {[
            ['01', 'The edge of water', 'A morning walk along the Loire.'],
            ['02', 'Slow looking', 'On making photographs that leave space.'],
            ['03', 'After the rain', 'Notes from a week in the Cévennes.'],
            ['04', 'Working light', 'A small list of things I carry.'],
          ].map(([number, heading, copy]) => (
            <div
              key={number}
              style={{
                padding: 14,
                minHeight: 108,
                borderRadius: 12,
                background: 'rgb(247,247,249)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.body,
                  fontWeight: 500,
                  fontSize: 12,
                  color: 'rgb(134,134,139)',
                }}
              >
                {number}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: '-0.03em',
                    color: 'rgb(35,35,38)',
                  }}
                >
                  {heading}
                </div>
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: 1.35,
                    color: 'rgb(134,134,139)',
                  }}
                >
                  {copy}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WindowShell>
  );
}

function DockBar({ onAbout }: { onAbout: () => void }) {
  const compact = useIsCompactViewport();

  return (
    <nav
      aria-label="我的博客"
      style={{
        position: 'absolute',
        bottom: compact ? 24 : 64,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 12 : 16,
        padding: compact ? 10 : 12,
        borderRadius: compact ? 20 : 24,
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
      }}
    >
      <DockIcon label="About Me" image={dockAssets.about} onClick={onAbout} />
      <div
        aria-hidden="true"
        style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.2)', borderRadius: 64 }}
      />
      <DockIcon label="GitHub" image={dockAssets.github} href="https://github.com/641-git641" />
    </nav>
  );
}

function App() {
  const [openProject, setOpenProject] = useState<Project | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const compact = useIsCompactViewport();

  const closeProject = useCallback(() => setOpenProject(null), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  return (
    <main
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: 'white',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.78)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(84,84,84,0) 0%, rgb(0,0,0) 100%)',
          opacity: 0.4,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '47.375%',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onOpen={setOpenProject} compact={compact} />
      ))}

      <DockBar onAbout={() => setAboutOpen(true)} />

      {openProject &&
        (openProject.view === 'languages' ? (
          <LanguagesWindow onClose={closeProject} />
        ) : openProject.view === 'blogs' ? (
          <BlogsWindow onClose={closeProject} />
        ) : openProject.view === 'bands' ? (
          <BandsWindow onClose={closeProject} />
        ) : openProject.view === 'thanks' ? (
          <ThanksWindow project={openProject} onClose={closeProject} />
        ) : (
          <ProjectWindow project={openProject} onClose={closeProject} />
        ))}
      {aboutOpen && <AboutWindow onClose={closeAbout} />}
    </main>
  );
}

export default App;
