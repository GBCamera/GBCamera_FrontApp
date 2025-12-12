# GBCamera : 자동 사진 촬영 / 편집 / 출력을 위한 인생네컷 프로그램
link : https://drive.google.com/drive/mobile/folders/1U2ma5XUovl_SQNrcKG6WjZd88T8ZTakt?usp=drive_link

<table>
<tr>
<td style="width: 20%">
<img src="https://github.com/user-attachments/assets/813babfc-c2f7-4809-abc7-d40f829ad6a0" alt="서비스 스크린샷""/>    
</td>
<td>

### [Front-end]
- React 19.1.1
- React Router DOM 7.9.4
- Zustand 5.0.8
- Vite 5.4.8
- Axios 1.13.1
- QRCode.react 4.2.0

### [Desktop-App]
- Electron 39.0.0
- Electron Builder 26.0.12

### [Back-end]
- Java / JDK : 17 (Eclipse Temurin, OpenJDK 17)
- Build Tool : Gradle (Wrapper, Java Toolchain 17)
- Spring Boot : 3.5.7
- Spring MVC : spring-boot-starter-web
- Spring Security : spring-boot-starter-security
- Validation : spring-boot-starter-validation
- MyBatis : mybatis-spring-boot-starter 3.0.5
- Lombok : 1.18.42
- Embedded Tomcat : 10.1.48 (Spring Boot 3.5.7 기본 내장 톰캣)  
- JDBC Driver : MySQL Connector/J 9.4.0

### [데이터베이스]
- MySQL : 8.0.44

### [배포]
- Docker : eclipse-temurin:17-jdk / 17-jre 기반 이미지
- CI/CD : GitHub Actions (docker/build-push-action v6, Docker Hub 푸시)
</br>
</td>
</tr>
</table>

</br>


## 2. 프로젝트 개요 및 소개

### (1) 💸프로젝트 주제 및 기획 배경
축제·행사에서 운영되는 포토부스를 운영자 없이 무인으로 안정적으로 운영하고,</br>
매년 다른 컨셉을 빠르게 적용할 수 있도록 확장성과 편의성을 강화한 인생네컷 자동화 프로그램입니다.

2024년에 진행한 인생네컷 프로젝트에서 자동 출력, 확장성 문제를 개선했습니다.</br>
(https://github.com/Yongjooon/GB_Camera) -> 2024버전

### (3) 서비스 소개
 자동으로 사진 촬영 → 편집 → 출력까지 제공하는 무인 인생네컷 포토부스 프로그램


### (5) 프로젝트 목표
 ⭐️ 포토부스의 완전 무인 자동화를 통해 운영자 편의성과 사용자의 만족도를 극대화하는 것 ⭐️

① **자동 사진 촬영**

 사용자가 시작을 누르면 자동으로 촬영 시퀀스 시작
 카운트다운, 촬영장 수 표시

    
② **자동 사진 편집**
   
원하는 프레임으로 사진 편집
혼자 촬영뿐만 아닌 특정 캐릭터와 함께 활영 가능


③ **자동 사진 출력**
    
편집 완료시 QR을 통한 이미지 다운과 연결된 프린터로 자동 사진 출력


⑤ **다양한 확장성**
    
.exe / .dmg 파일 모두 제공
실행 기기에 연결된 카메라, 프린터기 설정 가능


</br>

## 3. 주요 기능 소개

### (1) 시작 화면
* 프로그램 동작 시작 / 사용자의 고유 Index 생성
<img width="1470" height="956" alt="스크린샷 2025-11-20 오전 10 13 41" src="https://github.com/user-attachments/assets/3f9e97ef-1f05-44e9-a777-bd2cbda1c935" />




### (2) 혼자 촬영 / 함께 촬영
* 혼자 촬영할지 특정 캐릭터와 함께 촬영할지 선택
<img width="1470" height="956" alt="스크린샷 2025-11-20 오전 10 13 48" src="https://github.com/user-attachments/assets/ecf1ef3b-6f36-4f3e-bd52-083069518913" />




### (3) 사진 촬영
* 사진 촬영 시작
* 6초에 1번씩 총 6장의 사진 촬영 진행
<img width="1470" height="956" alt="스크린샷 2025-11-20 오전 10 15 05" src="https://github.com/user-attachments/assets/fe824280-6a15-4776-bdb3-7deac38cbe22" />
<img width="1470" height="956" alt="스크린샷 2025-11-20 오전 10 14 24" src="https://github.com/user-attachments/assets/7d09d518-1130-4039-872f-eda932c146b7" />



### (4) 사진 선택
* 6장의 사진 중 원하는 3장의 사진 선택
* 선택된 사진 취소 가능
<img width="1470" height="956" alt="스크린샷 2025-11-20 오전 10 14 39" src="https://github.com/user-attachments/assets/097621fe-b179-4551-aa34-aaeab3f304e4" />




### (5) 프레임 선택
* 원하는 프레임 이미지 선택
* 선택된 프레임 실시간 적용
<img width="1470" height="956" alt="스크린샷 2025-11-20 오전 10 14 47" src="https://github.com/user-attachments/assets/e50767a9-b06d-40eb-bbbe-0938720e3913" />




### (6) 사진 출력
* QR 코드를 통해 사용자 모바일 기기로 사진 다운 가능한 페이지 접속
* 별도의 안내창 출력 없이 연결된 프린터기로 사진 출력
* 연결된 프린터가 없을 시 안내 후 QR만 공유
<img width="1470" height="956" alt="스크린샷 2025-11-20 오전 10 14 58" src="https://github.com/user-attachments/assets/9448ee61-e6b5-476d-81ce-c8e7dd128a2c" />



</br>

## 4. 사용도구 및 기술

### (1) 시스템 아키텍처

<img width="984" height="519" alt="스크린샷 2025-11-20 오전 11 07 49" src="https://github.com/user-attachments/assets/47c9a8b2-74d7-4950-871c-1a75013356dc" />



### (2) Electron으로 만든 데스트톱 앱(.exe / .dmg)
- React로 구현한 웹 페이지를 Electron으로 감싸 하나의 데스크톱 애플리케이션으로 제작
- 웹 기반임에도 데스크톱 앱이기 때문에, 기기에 연결된 장치(프린터 등)를 직접 제어할 수 있어 실제 포토부스 운영 환경에 최적화
- Windows(.exe), macOS(.dmg) 양쪽 모두 빌드 가능하도록 구성해 확장성과 배포 편의성 강화
- 프로그램의 몰입감과 일체감을 높이기 위해 기본 데스크톱 창(UI 프레임)을 제거하여 훨씬 깔끔한 풀스크린 형태의 UI 제공

link : https://drive.google.com/drive/mobile/folders/1U2ma5XUovl_SQNrcKG6WjZd88T8ZTakt?usp=drive_link


### (3) CRUD
<img width="906" height="465" alt="스크린샷 2025-11-20 오전 10 59 44" src="https://github.com/user-attachments/assets/86e56538-329c-4eb4-8ec8-795a8691dfba" />




### (4) GitHub Action을 이용한 CI/CD(BE)

<img width="958" height="465" alt="스크린샷 2025-11-20 오전 11 05 07" src="https://github.com/user-attachments/assets/581a1a8c-3fd2-4369-b19d-08d0f8586295" />


### (5) 배포
- AWS : ec2, Vercel
- Web : Vercel
</br>


