import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';

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
  view?: 'languages' | 'bands' | 'thanks';
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

type DragState = {
  dragging: boolean;
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
    anchorX: 42.75,
    anchorY: 58.5,
    thumbnail: terminalIcon,
    view: 'languages',
  },
  {
    id: 2,
    title: 'BLOG',
    anchorX: 26,
    anchorY: 29.5,
    thumbnail: bookIcon,
  },
  {
    id: 3,
    title: '音乐',
    anchorX: 23.33,
    anchorY: 60.88,
    thumbnail: bandImage,
    view: 'bands',
  },
  {
    id: 4,
    title: '致谢',
    anchorX: 68,
    anchorY: 62.13,
    thumbnail:
      '/Friend.jpg',
    view: 'thanks',
  },
  {
    id: 5,
    title: '莫比乌斯环',
    anchorX: 73.92,
    anchorY: 40.75,
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

function useDraggable() {
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const dragState = useRef<DragState>({
    dragging: false,
    sx: 0,
    sy: 0,
    ox: 0,
    oy: 0,
    cx: 0,
    cy: 0,
  });
  const isDraggingRef = useRef(false);

  const onMouseDown = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (event.button !== 0) return;

      event.preventDefault();
      const state = dragState.current;
      state.dragging = true;
      state.sx = event.clientX;
      state.sy = event.clientY;
      state.ox = pos.x;
      state.oy = pos.y;
      state.cx = event.clientX;
      state.cy = event.clientY;
      isDraggingRef.current = false;

      const handleMove = (moveEvent: globalThis.MouseEvent) => {
        const current = dragState.current;
        if (!current.dragging) return;

        current.cx = moveEvent.clientX;
        current.cy = moveEvent.clientY;
        const dx = current.cx - current.sx;
        const dy = current.cy - current.sy;

        if (Math.hypot(dx, dy) >= 5) {
          isDraggingRef.current = true;
        }

        setPos({ x: current.ox + dx, y: current.oy + dy });
      };

      const handleUp = () => {
        dragState.current.dragging = false;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
    },
    [pos.x, pos.y],
  );

  return { pos, onMouseDown, isDraggingRef };
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (project: Project) => void }) {
  const [hovered, setHovered] = useState(false);
  const { pos, onMouseDown, isDraggingRef } = useDraggable();

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
    left: `calc(${project.anchorX}% - 52px)`,
    top: `calc(${project.anchorY}% - 64px)`,
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
    padding: 12,
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
    fontSize: 16,
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
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
            width: 80,
            height: 60,
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
  const windowDragState = useRef({
    dragging: false,
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

  const handleTitleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();

    const state = windowDragState.current;
    state.dragging = true;
    state.sx = event.clientX;
    state.sy = event.clientY;
    state.ox = windowPosition.x;
    state.oy = windowPosition.y;
    setWindowDragging(true);

    const handleMove = (moveEvent: globalThis.MouseEvent) => {
      if (!windowDragState.current.dragging) return;
      setWindowPosition({
        x: windowDragState.current.ox + moveEvent.clientX - windowDragState.current.sx,
        y: windowDragState.current.oy + moveEvent.clientY - windowDragState.current.sy,
      });
    };

    const handleUp = () => {
      windowDragState.current.dragging = false;
      setWindowDragging(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const panelStyle: CSSProperties = {
    width: wide ? '70vw' : '60vw',
    maxWidth: wide ? 840 : 720,
    height,
    maxHeight: height ?? '70vh',
    borderRadius: 24,
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
          }}
          onMouseDown={handleTitleMouseDown}
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
            padding: 16,
            gap: 16,
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
  const isSplit = layout === 'split';

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
  return (
    <nav
      aria-label="我的博客"
      style={{
        position: 'absolute',
        bottom: 64,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 12,
        borderRadius: 24,
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
        <ProjectCard key={project.id} project={project} onOpen={setOpenProject} />
      ))}

      <DockBar onAbout={() => setAboutOpen(true)} />

      {openProject &&
        (openProject.view === 'languages' ? (
          <LanguagesWindow onClose={closeProject} />
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
