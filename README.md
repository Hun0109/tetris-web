# 🎮 Neon Tetris (네온 테트리스)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Canvas](https://img.shields.io/badge/HTML5_Canvas-FF6F00?style=for-the-badge&logo=html5&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-4A154B?style=for-the-badge&logo=webauthn&logoColor=white)

> **화려한 네온 비주얼과 자체 합성 레트로 사운드를 담은 모던 웹 테트리스 게임**  
> 외부 라이브러리나 무거운 에셋 의존성 없이, 순수 **HTML5 Canvas**, **Vanilla JavaScript**, **Web Audio API**로 제작된 경량 웹 브라우저 게임입니다.

---

실행 링크 : https://hun0109.github.io/tetris-web/

## ✨ 주요 특징 (Features)

### 1. 🌌 화려한 네온 & 사이버펑크 감성 비주얼
- Canvas shadowBlur와 네온 컬러 팔레트를 활용한 발광 블록 이펙트
- 라인 클리어 시 사방으로 튀는 **다이내믹 파티클 폭발 효과**
- 세련된 글래스모피즘(Glassmorphism)과 애니메이션 배경

### 2. 🕹️ 정통 테트리스 공식 메커니즘 충실 구현
- **7-Bag 무작위 생성기**: 동일한 블록이 연속으로 나오거나 특정 블록이 지나치게 안 나오는 현상을 방지하는 공식 7-Bag 시스템
- **고스트 피스 (Ghost Piece)**: 블록이 착지할 위치를 반투명 가이드 그림자로 미리 표시
- **홀드 (Hold) 시스템**: 원하는 타이밍에 블록을 킵해두고 교체 사용
- **하드 드롭 & 소프트 드롭**: 즉시 착지 및 가속 낙하 지원
- **스마트 회전 & 벽 차기(Wall Kick)**: 벽이나 바닥 근처에서 회전 시 자연스럽게 밀려나며 회전

### 3. 🔊 Web Audio API 실시간 사운드 신디사이저
- 외부 MP3/WAV 음원 파일 다운로드 **Zero!**
- 브라우저 내장 Web Audio API 오실레이터(Oscillator)를 사용하여 8-bit 레트로 음향 실시간 합성
- 이동, 회전, 하드드롭, 라인 클리어, 테트리스(4줄 클리어), 레벨업, 게임오버 전용 사운드
- 사운드 토글(ON/OFF) 및 설정값 localStorage 영구 보존

### 4. 📱 완벽한 반응형 웹 & 모바일 터치 패드
- PC 환경(키보드)과 모바일/태블릿(화면 터치 버튼) 모두 완벽 지원
- 터치 친화적 D-Pad와 기능 버튼(HOLD, ROTATE, HARD DROP, PAUSE) 내장

### 5. 🏆 스코어 및 무한 레벨링 시스템
- 라인 클리어 수에 따라 레벨이 올라가며 점진적으로 낙하 속도 증가
- 브라우저 로컬 저장소(localStorage)를 통한 최고 점수(High Score) 자동 기록

---

## ⌨️ 조작 방법 (Controls)

### 💻 PC 키보드
| 기능 | 조작키 | 설명 |
| :--- | :--- | :--- |
| **좌 / 우 이동** | ← / → | 블록을 좌우로 한 칸씩 이동 |
| **소프트 드롭** | ↓ | 블록 낙하 속도 가속 |
| **하드 드롭** | Space | 즉시 바닥으로 블록 낙하 및 고정 |
| **시계 방향 회전** | ↑ 또는 X | 블록을 시계 방향으로 90도 회전 |
| **반시계 방향 회전**| Z | 블록을 반시계 방향으로 90도 회전 |
| **블록 홀드 (Hold)** | Shift 또는 C | 현재 블록 보관 또는 보관된 블록과 교체 |
| **일시 정지 / 재개**| P 또는 Esc | 게임 일시 정지 및 설정 오버레이 표시 |

### 📱 모바일 터치 패드
- 화면 하단에 배치된 온스크린 터치 버튼으로 모든 조작을 직관적으로 플레이할 수 있습니다.

---

## 📁 프로젝트 구조 (Directory Structure)

`plaintext
tetris-web/
├── index.html        # 메인 HTML 레이아웃, UI 패널 및 캔버스 뷰포트
├── styles.css        # 네온 사이버펑크 테마, 애니메이션, 반응형 스타일시트
└── js/
    ├── audio.js      # Web Audio API 기반 무음원 신디사이저 엔진
    └── tetris.js     # 테트리스 코어 게임 엔진 (물리, 충돌, 점수, 렌더링)
`

---

## 🚀 빠른 시작 (Getting Started)

별도의 빌드 도구나 Node.js 설치가 필요하지 않습니다.

1. **저장소 클론하기**
   `ash
   git clone https://github.com/Hun0109/tetris-web.git
   `
2. **실행하기**
   - 폴더 내 index.html 파일을 더블 클릭하여 크롬, 엣지, 사파리 등 최신 웹 브라우저에서 바로 실행합니다.
   - 또는 VS Code의 Live Server 확장을 통해 로컬 서버로 플레이할 수 있습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Language:** JavaScript (ES6+)
- **Graphics:** HTML5 Canvas API (2D Context)
- **Audio:** Web Audio API (Synthesizer)
- **Styling:** Modern CSS3 (Flexbox, CSS Grid, Custom Properties, Glassmorphism)
- **Typography:** Google Fonts (Outfit, Noto Sans KR, Press Start 2P)
- **Storage:** Web Storage API (localStorage)

---

## 📄 라이선스 (License)

이 프로젝트는 오픈 소스로 자유롭게 학습, 수정 및 배포가 가능합니다.
