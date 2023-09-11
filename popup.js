/**
 * ---------------------------------------------------------------------------------
 * | 팝업 |
 * ---------------------------------------------------------------------------------
 **/

let toggleClick = document.getElementById("toggleClick");
toggleClick.addEventListener("change", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: handleClick,
  });
});

// changeColor ID element 를 취득
let changeColor = document.getElementById("changeColor");

// // 스토리지에 저장되어 있는 컬러가 있다면 표시
// chrome.storage.sync.get("color", ({ color }) => {
//   changeColor.style.backgroundColor = color;
// });

// 배경색 버튼을 클릭하였을 경우 이벤트 등록
window.localStorage.setItem("isRunning", "N");

changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: handleClick,
  });
});

const handleClick = () => {
  let josa_arr = [
    "가",
    "를",
    "는",
    "와",
    "으로",
    "로",
    "이",
    "을",
    "은",
    "과",
    "에게",
    "의",
    "께",
    "께서",
    "에서",
    "뿐만",
    "뿐",
    "에게로",
  ];
  const req_data = (data) => {
    //보낼때 조사 분리해서 던지셈 씨@@벌
    //분리할때 특수기호 보이는거 다 잡기

    //모달 디자인

    //고아새끼 잡을 방법 있으면 진짜 완벽 그 자체  이거 Ok면 색상 필요 없음
    //색상 표시 할까 말까

    //페이지 두개로 겹치게 나옴

    return fetch("https://api.racgoo.r-e.kr:4000/word/getWord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word: `${data}` }),
    });
  };
  let isRunning = window.localStorage.getItem("isRunning");
  let newIsRunning = isRunning === "Y" ? "N" : "Y";
  window.localStorage.setItem("isRunning", newIsRunning);
  if (newIsRunning === "Y") {
    const activeFunction = (preHtml = "") => {
      window.localStorage.setItem("preHtml", document.body.innerHTML);
      document.body.style.position = "relative";
      let popupHTML = `<div  id='justPopupModal123'  style="display: none;left: 0px;top: 0px;z-index: 999999999999;background-color: #FFFFFF;position: absolute;border: 1px solid black; pointer-events: none;"></div>`;
      document.body.innerHTML = document.body.innerHTML + popupHTML;
      function dfs(parentDOM) {
        if (parentDOM.children.length > 0) {
          for (let i = 0; i < parentDOM?.children.length; i++) {
            dfs(parentDOM?.children[i]);
          }
        } else {
          let random;
          let random_num_arr = [];
          let is_spacing = false;
          let word_data = parentDOM.innerHTML
            .replaceAll(/[.,'"()/:&\^#@\!\-~<>]/gi, " ")
            .split(" ");
          let split_data = "";
          if (word_data.length !== 1) {
            is_spacing = true;
          }
          for (var k = 0; k < word_data.length; k++) {
            if (word_data[k].length !== 0) {
              random = parseInt(Math.random() * 1000000000);
              random_num_arr.push(random);
              split_data +=
                `<span style="color: #0067a3;position: relative;display: inline-block;cursor: pointer;" id="us_${random}"  >${word_data[
                  k
                ].trim()}</span>` + "&nbsp";
            } else {
              null;
            }
          }
          parentDOM.innerHTML = split_data;

          random_num_arr.map((val, idx) => {
            document.querySelectorAll(`#us_${val}`).forEach((node) => {
              node.addEventListener("mouseenter", (mouseEvent) => {
                let parsing_word = "";
                if (is_spacing === true) {
                  for (var i = 0; i < josa_arr.length; i++) {
                    let josa_length = josa_arr[i].length;
                    var tmp_str = node.innerHTML.slice(
                      node.innerHTML.length - josa_length
                    );
                    if (tmp_str === josa_arr[i]) {
                      parsing_word = node.innerHTML.replace(josa_arr[i], "");
                      break;
                    } else {
                      parsing_word = node.innerHTML;
                    }
                  }
                } else {
                  parsing_word = node.innerHTML;
                }
                console.log(is_spacing);
                console.log(parsing_word);
                document.getElementById(
                  "justPopupModal123"
                ).innerHTML = `<div style="width: 50px;height: 50px;display: flex;justify-content: center;flex-direction: column; align-items: center">
                <div style="font-size: 12px">검색중...</div>
                <img style="width: 30px;height: 30px" src='https://loadingapng.com/animation.php?image=4&fore_color=000000&back_color=FFFFFF&size=128x128&transparency=1&image_type=0&uncacher=75.5975991029623' style='position: relative; display: block; margin: 0px auto;'/>
            </div>`;
                document.getElementById("justPopupModal123").style.top =
                  (
                    mouseEvent.pageY -
                    document.getElementById("justPopupModal123").offsetHeight
                  ).toFixed(0) + "px";
                req_data(parsing_word)
                  .then((rawRes) => rawRes.json())
                  .then((res) => {
                    if (res.data.wordList.length !== 0) {
                      document.getElementById("justPopupModal123").innerHTML = `
                    <div>
                      <div>
                        ${res.data.wordList[0].word}
                      </div>
                      <div>
                        ${res.data.wordList.map(
                          (item) => "<div>" + item.description + "</div>"
                        )}
                      </div>
                    </div>
                    `;
                    } else {
                      if (res.data.type === "namuwiki") {
                        document.getElementById(
                          "justPopupModal123"
                        ).innerHTML = `<div>데이터를 찾을 수 없습니다.</div>`;
                      } else {
                        document.getElementById(
                          "justPopupModal123"
                        ).innerHTML = `<div>검색한 단어가 DB에 저장되어 있지 않아요...<br/> 인터넷에 검색하여 업데이트 중입니다...<br/> 잠시후 다시 시도해주세요.</div>`;
                      }
                    }

                    document.getElementById("justPopupModal123").style.top =
                      (
                        mouseEvent.pageY -
                        document.getElementById("justPopupModal123")
                          .offsetHeight
                      ).toFixed(0) + "px";
                  });

                let nodeRect = node.getBoundingClientRect();
                document.getElementById("justPopupModal123").style.display =
                  "block";
                document.getElementById("justPopupModal123").style.left =
                  (nodeRect.left + window.scrollX).toFixed(0) + "px";
                document.getElementById("justPopupModal123").style.top =
                  (nodeRect.top + window.scrollY - nodeRect.height).toFixed(0) +
                  "px";
              });
              node.addEventListener("mouseleave", (event) => {
                document.getElementById("justPopupModal123").style.display =
                  "none";
              });
            });
          });

          //자식이 없음
        }
      }
      dfs(document.body);
    };
    activeFunction(document.body.innerHTML);
  } else {
    const cleanFunction = () => {
      let preHtml = window.localStorage.getItem("preHtml");
      document.body.innerHTML = preHtml;
    };
    cleanFunction();
  }
};

// <div class={CellComment}>
//   <div>{원래 내용}</div>
//   <div class={CellWithComment}>
//     툴팁
//   </div>
// </div>

/**
 * @description 현재 웹 페이지의 Body 요소의 배경색을 변경해주는 함수
 **/
// function setPageBackgroundColor() {
//   chrome.storage.sync.get("color", ({ color }) => {
//     document.body.style.backgroundColor = color;
//   });
// }
