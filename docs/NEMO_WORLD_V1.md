# NEMO WORLD V1 — Unity / Product Baseline

> Status: V1 planning baseline
> Purpose: prevent the project from growing by patchwork again, and give Unity/Codex one stable source of truth.

---

## 1. One-line vision

**세상의 모든 네모난 것이 캐릭터가 되고, 물건의 특징 자체가 움직임·스킬·꾸미기가 되는 귀엽고 엉뚱한 캐주얼 게임 세계.**

`네모 운동회`는 전체 게임의 대표 콘텐츠 중 하나이며, 전체 세계를 스포츠 하나에만 제한하지 않는다.

---

## 2. What makes NEMO WORLD different

### Core fantasy
- 각설탕, 벽돌, 금고, 아파트, 노트북, 냉장고처럼 현실의 네모난 물건이 살아 움직인다.
- 캐릭터는 단순 스킨 교체가 아니라 **원래 물건의 성질**이 개성이 된다.
- 새로운 캐릭터를 보면 유저가 먼저 `얘는 어떻게 움직이지?`, `얘는 뭘로 공격하지?`, `뭘 꾸밀 수 있지?`가 궁금해야 한다.

### Design pillars
1. **Cute + absurd** — 귀엽지만 상황은 진지해서 웃기다.
2. **Object identity first** — 물건의 재질/구조/기능을 버리지 않는다.
3. **One character, many games** — 같은 캐릭터를 운동회·디펜스·파티 등 여러 모드에서 재사용한다.
4. **Short play, long attachment** — 한 판은 짧고, 캐릭터 수집/성장/꾸미기는 오래 간다.
5. **Shareable moments** — 결과와 장면이 숏폼/친구 공유 소재가 되기 쉬워야 한다.

---

## 3. V1 scope

V1은 거대한 완성형 게임이 아니다. 아래 구조가 실제로 재미있는지 검증하는 **Vertical Slice**다.

### First characters
- 각설탕
- 벽돌
- 금고
- 아파트

### First playable modes
1. **네모 운동회 — 100m**
   - 기존 웹 프로토타입의 재미를 참고하되 코드를 그대로 이식하지 않는다.
   - 좌/우 발 번갈아 입력
   - 같은 발 연속 입력 시 실수/비틀거림
   - 좋은 리듬은 가속
   - 추월, 막판 스퍼트, 결승, 결과

2. **네모 디펜스 — Prototype**
   - 캐릭터의 물건 특성이 스킬/공격 방식이 되는지 검증한다.
   - V1에서는 1스테이지 + 3~4캐릭터 정도면 충분하다.

### Meta layer — intentionally shallow in V1
- 캐릭터 수집
- 간단한 성장
- 도감
- 캐릭터 고유 꾸미기

V1에서 실시간 PvP, 길드, 거래, 대규모 온라인 월드, 수십 개 게임모드 등은 만들지 않는다.

---

## 4. Character philosophy

캐릭터는 먼저 `본질`을 정의하고, 각 게임모드는 그 본질을 자기 방식으로 번역한다.

예시 — 각설탕:

```text
본질: 작다 / 가볍다 / 달다 / 잘 깨진다 / 통통 튄다 / 열심히 한다

100m      -> 짧은 보폭 + 빠른 발 + 아장아장
장애물    -> 가볍고 통통 튀는 점프
디펜스    -> 분열 / 끈적임 / 지원형
광장      -> 작은 통통 움직임
승리      -> 신나서 연속 바운스
실패      -> 데굴데굴 굴러감
```

캐릭터마다 다른 모드용 캐릭터를 새로 정의하지 않는다. **하나의 Character Definition이 모든 모드의 source of truth**가 된다.

---

## 5. First four character baselines

### 5.1 각설탕
- 성격: 순둥이, 성실함, 약간의 허당
- 재질: 따뜻한 아이보리 설탕 큐브, 미세한 설탕 결정
- 신체: 매우 짧고 가는 검은 팔/다리, 작은 둥근 손, 살짝 납작한 발
- 기본 모션: 아장아장 / 아다다다 / 미세한 좌우 뒤뚱
- 실패: 큰 몸통이 관성을 못 이겨 데굴데굴
- 기본 장비 없음

### 5.2 벽돌
- 성격: 괜히 진지하고 투박하지만 열정적
- 재질: 따뜻한 적갈색 점토/거친 표면
- 체급: 각설탕보다 넓고 묵직함
- 기본 모션: 쿵쿵 / 직진형
- 디펜스 아이디어: 돌진 / 내려찍기 / 벽 생성

### 5.3 금고
- 성격: 무뚝뚝하지만 든든함
- 재질: 메탈 그레이 + 시그니처 다이얼/손잡이
- 체급: 무거운 중대형
- 기본 모션: 덜컹 / 느리지만 끈질김
- 디펜스 아이디어: 철벽 / 문으로 밀치기 / 잠금 계열

### 5.4 아파트
- 성격: 덩치는 큰데 순한 허당 거인
- 재질: 따뜻한 건물 외벽 + 창문
- 체급: 첫 4캐릭터 중 가장 큼
- 기본 모션: 휘청휘청 / 뒤뚱 / 우당탕
- 디펜스 아이디어: 여러 창문/주민을 활용한 범위 지원

---

## 6. Customization philosophy

모든 캐릭터에 같은 `모자/신발` 슬롯만 강제로 적용하지 않는다.

**물건마다 꾸미는 방식 자체가 달라야 한다.**

Examples:

### Apartment
- exteriorColor
- windowStyle / windowColor
- rooftop
- entrance
- garden / sign / decoration

### Laptop
- bodyColor
- stickers
- scribbles
- screenTheme
- cornerTape / charms

### Safe
- metalColor
- dialStyle
- handle
- warningSticker
- surfaceDecal

### Sugar
- wrapperAccent
- ribbon
- faceAccessory
- tiny surface mark
- effect

꾸미기는 V1에서 성능보다 **애착/표현**이 우선이다.

---

## 7. Art direction

### Problem learned from the web prototype
고퀄 3/4 캐릭터 이미지를 경기 화면에 잘라 붙이는 방식은 캐릭터가 배경과 분리되어 `스티커`처럼 보였다. 또한 완전 사이드뷰는 물건 캐릭터의 앞면/재질/구조적 특징을 죽였다.

### Unity target
- 3D character + 3D/2.5D presentation
- 카메라는 완전 사이드 고정이 아니라 **약한 3/4 시점**을 우선 테스트
- 현실 물건의 재질을 살리되 지나친 사실주의는 금지
- 밝고 부드러운 stylized 3D / 2.5D cartoon
- 모든 캐릭터가 같은 조명, 같은 얼굴 문법, 같은 손발 문법, 같은 그림자 규칙을 공유
- 캐릭터는 가만히 있어도 살아 있어야 함: idle, blink, tiny body motion

### Asset layers
1. **Master 3D character/model** — source of truth
2. **Showcase presentation** — 홈/도감/선택/결과에서 가장 예쁘게
3. **Gameplay presentation** — 작은 크기와 움직임에서도 잘 읽히게

장면별 개별 그림을 새 캐릭터처럼 다시 그려 일관성을 잃는 방식은 피한다.

---

## 8. Unity first experiment — CharacterLab

Unity 전환 여부는 전체 게임을 먼저 옮겨서 판단하지 않는다.

### First test goal
**각설탕 1마리가 Unity에서 실제 살아있는 캐릭터처럼 느껴지는가?**

### CharacterLab scene responsibilities
- 캐릭터 360도 확인
- idle
- blink / face reaction
- walk
- run
- stumble / fall
- victory
- material/color variant
- cosmetic attach/remove
- camera angle test
- light/shadow test

새 캐릭터는 게임모드에 넣기 전에 CharacterLab에서 먼저 통과한다.

### Sugar first prototype
- Rounded cube body
- short black limbs
- simple hands/feet
- large expressive eyes
- warm ivory material
- subtle sugar roughness
- no headband/shoes/gear on base character

Movement target:
- 작은 보폭
- 빠른 발 주기
- 운동선수식 큰 팔치기 금지
- 미세한 좌우 waddle
- 약한 squash & stretch
- 속도가 올라가도 보폭을 크게 늘리기보다 발 빈도를 높임

Desired feeling:

> 원래 달리면 안 될 것 같은 각설탕이 짧은 팔다리로 죽어라 아장아장 뛴다.

---

## 9. Camera test baseline

CharacterLab 첫 카메라 후보:
- Perspective
- character front/side가 동시에 보이는 약 25~35° 3/4 angle
- FOV 약 30~38부터 테스트
- 캐릭터가 화면에서 충분히 크게 보일 것

100m 역시 기존 완전 사이드뷰를 자동으로 답으로 간주하지 않는다. 캐릭터 매력이 살아나는 시점을 우선 검증한다.

---

## 10. Proposed Unity project structure

```text
Assets/
  NemoWorld/
    Core/
      Save/
      Input/
      Audio/
      Rewards/
    Characters/
      Shared/
      Sugar/
      Brick/
      Safe/
      Apartment/
    Customization/
    Games/
      Sprint100/
      Defense/
    Meta/
      Collection/
      Growth/
      Codex/
    Scenes/
      CharacterLab/
      Home/
      GameSelect/
    UI/
    Art/
      Materials/
      VFX/
      Audio/
```

초기부터 각 기능을 새로운 loader/wrapper/string patch로 덧대지 않는다.

---

## 11. Character data direction

Concept example only — final C# schema may differ.

```text
CharacterDefinition
- id
- displayName
- category
- scaleClass
- materialProfile
- personalityTags
- movementProfile
- customizationSlots
- sprintProfile
- defenseProfile
- reactionProfile
```

### Rule
- CharacterDefinition = data
- CharacterView/Controller = visual + motion
- Game mode = rules
- Save/Profile = ownership + progression + cosmetics

게임모드 코드 안에 캐릭터별 예외를 계속 하드코딩하지 않는다.

---

## 12. 100m migration rule

기존 웹 100m는 **reference/prototype**로 보존한다.

Unity로 가져올 것:
- 번갈아 발 입력의 재미
- 같은 발 연속 입력 실수
- 리듬/가속 감각
- AI와 순위 경쟁
- 추월 피드백
- 막판 스퍼트
- 결과/PB의 짧은 보상감

Unity로 가져오지 않을 것:
- 기존 loader/string patch/eval 구조
- 화면별로 다르게 붙인 캐릭터 이미지 구조
- 임시 UI를 그대로 복제하는 것

`코드 이식`보다 `재미 이식`을 우선한다.

---

## 13. Defense prototype rule

디펜스는 전투 자체가 목적이 아니라 **물건의 특징이 스킬이 되는 재미를 검증**하기 위한 두 번째 대표 모드다.

Examples:
- 각설탕: 분열 / 끈적임
- 벽돌: 돌진 / 벽 생성
- 금고: 방어 / 밀치기 / 잠금
- 아파트: 다중 창문 지원 / 넓은 범위

V1에서는 복잡한 성장트리와 수십 스킬을 만들지 않는다.

Success question:

> 100m에서 쓰던 캐릭터를 디펜스에 가져갔을 때, 같은 캐릭터인데 전혀 다른 재미가 나는가?

---

## 14. Codex workflow

Codex는 자잘한 감각 튜닝보다 **구조적/반복 가능한 큰 작업**에 사용한다.

### Good Codex jobs
- Unity project architecture
- CharacterLab tooling
- editor scripts
- shared character framework
- data definitions
- 100m system migration
- defense system skeleton
- tests / validation / refactor

### Avoid spending Codex on
- 다리 길이 1~2% 조정
- 보폭 숫자 미세 변경
- 눈 위치 몇 픽셀 이동
- 단일 색상 조정

이런 미세조정은 CharacterLab의 exposed parameters / inspector values로 직접 튜닝할 수 있게 만든다.

### Collaboration rule
친구와 함께 개발할 경우 같은 기능/파일을 동시에 바이브코딩하지 않는다.
- main/core owner 1명
- game mode별 독립 ownership
- feature branch + PR
- merge/deploy는 기준 담당자가 관리

---

## 15. First Codex implementation brief

PC에서 Unity 프로젝트를 만든 뒤 첫 Codex 작업은 다음 정도로 제한한다.

```text
Create the NemoWorld Unity foundation without building the full game.

1. Establish the Assets/NemoWorld folder structure.
2. Create a CharacterLab scene and supporting scripts.
3. Implement a data-driven CharacterDefinition baseline.
4. Build a simple procedural Sugar prototype from primitive/rounded-cube parts.
5. Add idle, blink, tiny-step run, waddle, squash/stretch and stumble test controls.
6. Add a 3/4 camera preset and simple soft lighting.
7. Expose key motion/body proportions as Inspector parameters so visual tuning does not require code edits.
8. Do not migrate the existing web game yet.
9. Do not add monetization, backend, multiplayer, inventory complexity or extra game modes.
10. Report all created/modified files and any manual Unity Editor steps required.
```

---

## 16. V1 milestone order

### M0 — Character proof
- Unity project created
- CharacterLab works
- Sugar looks coherent from multiple angles
- Sugar idle/run/stumble feels alive

### M1 — Character framework
- Sugar/Brick/Safe/Apartment use the same character framework
- character definitions are data-driven
- basic customization attachment system works

### M2 — Sprint proof
- 100m core loop recreated in Unity
- 4 characters are readable and feel different
- race start → play → finish → result is polished enough to show someone

### M3 — Defense proof
- 1 playable stage
- at least 3 character-specific skills
- same owned character data works in both Sprint and Defense

### M4 — Meta shell
- Home
- Character Select / Collection
- simple customization
- simple progression
- save/load

Only after M0–M4 are fun and coherent should content breadth increase.

---

## 17. V1 acceptance criteria

V1 is successful when all of the following are true:

1. 캐릭터가 잘라 붙인 PNG가 아니라 `같은 세계에서 살아있는 물체`처럼 느껴진다.
2. 각설탕/벽돌/금고/아파트를 멀리서도 구분할 수 있다.
3. 네 캐릭터가 같은 렌더링/애니메이션 문법을 공유한다.
4. 각 캐릭터는 달리는 방식에서 개성이 느껴진다.
5. 같은 캐릭터를 100m와 디펜스에서 사용했을 때 정체성은 유지되면서 플레이는 달라진다.
6. 꾸미기는 단순 색놀이가 아니라 물건의 특성을 활용한다.
7. 새 캐릭터 추가가 기존 게임 코드를 뜯어고치는 작업이 아니다.
8. 친구에게 짧게 보여줬을 때 `다음에는 어떤 네모가 나오지?`라는 궁금증이 생긴다.

---

## 18. Current decision

**Do not expand the old web prototype further as the foundation of NEMO WORLD.**

The web version remains a gameplay/reference prototype. The next serious implementation path is:

```text
Character concept
→ Unity CharacterLab
→ Character framework
→ Sugar proof
→ 4-character proof
→ 100m vertical slice
→ Defense vertical slice
→ Meta layer
```

The first quality gate is not feature count.

> **각설탕 한 마리가 정말 살아있는 캐릭터처럼 보이고 움직이는가?**

If the answer is no, stop and fix character/model/camera/motion before expanding the game.
