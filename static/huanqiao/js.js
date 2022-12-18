  let gameData = [];
  let operateSelect = -1;
  let stons = [];
  let possibilities = [];
  let stonsIndex = -1;
  let selectElement;
  let forecasts = -1;
  const selectStyle = "box-shadow: 0px 0px 5px 1.5px aqua;z-index: 1;";
  function initGame() {
    const boardImage = document.getElementById("boardImage");
    boardImage.src = imgBoard;
    const refreshImage = document.getElementById("refreshImage");
    refreshImage.src = imgRefresh;
    const gameWrapper = document.getElementById("gameWrapper");
    for (let i = 0; i < 36; i++) {
      const img = initImg("img-grid", imgSrc[0], i, true);
      gameWrapper.appendChild(img);
      gameData.push(0);
    }
    const stoneWrapper = document.getElementById("stoneWrapper");
    const stone = initImg("img-grid1", r_stone, -1);
    stoneWrapper.appendChild(stone);
    stone.style = selectStyle;
    selectElement = stone;
    const swordWrapperH = document.getElementById("swordWrapperH");
    for (let i = 0; i < swordH.length; i++) {
      swordWrapperH.appendChild(initImg("img-grid2", imgSrc[swordH[i]], swordH[i]));
    }
    const swordWrapperV = document.getElementById("swordWrapperV");
    for (let i = 0; i < swordV.length; i++) {
      swordWrapperV.appendChild(initImg("img-grid2", imgSrc[swordV[i]], swordV[i]));
    }
    const boxWrapper = document.getElementById("boxWrapper");
    for (let i = 0; i < box.length; i++) {
      boxWrapper.appendChild(initImg("img-grid2", imgSrc[box[i]], box[i]));
    }
    const clearWrapper = document.getElementById("clearWrapper");
    clearWrapper.appendChild(initImg("img-grid1", imgSrc[1], 1));
    clearWrapper.appendChild(initImg("img-grid1", imgSrc[0], 0));
  }
  function initImg(className, src, i, isGrid = false) {
    const img = document.createElement("img");
    img.className = className;
    img.src = src;
    if (isGrid) {
      img.onclick = clickGrid.bind(this, i);
    } else {
      img.onclick = operate.bind(this, i, img);
    }
    return img;
  }
  initGame();
  function reloadPage() {
    console.log("reloadPage");
    window.location.reload();
  }
  function clickGrid(index) {
    showLog && console.log("clickGrid");
    //需要先填充不可点击的区域
    if (stons.length < 5 && operateSelect > 0) {
      setTimeout(() => window.alert("请先选择不可点击的区域"), 0);
      return;
    }
    const oldType = gameData[index];
    //不能将特殊的格子互相替换
    if (oldType > 0 && operateSelect > 0 && oldType !== operateSelect) {
      setTimeout(() => window.alert("不能这么替换"), 0);
      return;
    }
    if (operateSelect == -1) {
      if (stons.indexOf(index) == -1 && stons.length < 5) {
        stons.push(index);
        gameData[index] = -1;
        const gameWrapper = document.getElementById("gameWrapper");
        const img = gameWrapper.children[index];
        img.src = r_stone;
        if (stons.length === 5) {
          operateSelect = 0;
          showLog && console.log(stons);
          stons.sort(sortFunc);
          matchData();
        }
      }
    } else if (operateSelect === 0) {
      //撤销操作
      if (oldType === -1) {
        gameData[index] = operateSelect;
        stons.splice(stons.indexOf(index), 1);
        changeImg(index);
      } else {
        let forecastType = 0;
        if (forecasts >= 0) {
          forecastType = gameData[forecasts];
        }
        if (isSwordType(oldType) || isSwordType(forecastType)) {
          //其他类型的话可能填充了界面,把与之关联的也清除了
          for (let i = 0; i < gameData.length; i++) {
            if (isSwordType(gameData[i])) {
              gameData[i] = 0;
              changeImg(i);
            }
          }
        } else if (isBoxType(oldType) || isBoxType(forecastType)) {
          for (let i = 0; i < gameData.length; i++) {
            if (isBoxType(gameData[i])) {
              gameData[i] = 0;
              changeImg(i);
            }
          }
        }
      }
      clearTips();
      gameData[index] = operateSelect;
      changeImg(index);
      if (stons.length === 5) {
        recorded();
        confirmAll();
        showTips();
      }
    } else {
      //选择数据后进行排除
      gameData[index] = operateSelect;
      confirm(index);
    }
  }
  function matchData() {
    stonsIndex = -1;
    for (let i = 0; i < stone.length; i++) {
      let stoneData = stone[i].sort(sortFunc);
      let equality = true;
      for (let j = 0; j < stoneData.length; j++) {
        if (stons[j] != stoneData[j]) {
          equality = false;
          break;
        }
      }
      if (equality) {
        stonsIndex = i;
        break;
      }
    }
    showLog && console.log(stonsIndex);
    if (stonsIndex == -1) {
      setTimeout(() => window.alert("不可点击的区域选择有误"), 0);
    } else {
      recorded();
      showTips();
    }
  }
  //纪录仅有不可点击格子的可能性数据
  function recorded() {
    showLog && console.log("recorded");
    possibilities = [];
    for (let i = 0; i < 36; i++) {
      for (let j = 0; j < data[stonsIndex].length; j++) {
        if (!possibilities[i]) {
          possibilities[i] = [];
        }
        possibilities[i].push(data[stonsIndex][j][i]);
      }
    }
    showLog && console.log(possibilities);
  }
  //排除所有坐标的数据
  function confirmAll() {
    showLog && console.log("confirmAll");
    showLog && console.log(gameData);
    for (let i = 0; i < gameData.length; i++) {
      if (gameData[i] > 0) {
        confirm(i);
      }
    }
  }
  //排除其他数据(指定坐标)
  function confirm(index) {
    const type = gameData[index];
    let indexs = [];
    for (let i = 0; i < possibilities[index].length; i++) {
      if (possibilities[index][i] === type) {
        indexs.push(i);
      }
      //空格子也有是宗长没出现变得
      if (type === 1) {
        if (possibilities[index][i] === 99 || possibilities[index][i] === 98) {
          indexs.push(i);
        }
      }
    }
    if (indexs.length === 0) {
      setTimeout(() => window.alert("填充的区域有误!请重新填充"), 0);
      gameData[index] = 0;
      return;
    }
    let arr = [];
    for (let i = 0; i < possibilities.length; i++) {
      if (!arr[i]) {
        arr[i] = [];
      }
      for (let j = 0; j < indexs.length; j++) {
        arr[i].push(possibilities[i][indexs[j]]);
      }
    }
    possibilities = arr;
    showLog && console.log("可能的数据:");
    showLog && console.log(possibilities);
    clearTips();
    //有可能点击的是空白区域
    if (type === 1) {
      changeImg(index);
      //判断是否有同一个模式的宝箱或者剑
      let isSame = true;
      for (let i = 0; i < possibilities.length; i++) {
        let sameType = possibilities[i][0];
        if (sameType <= 1) {
          continue;
        }
        isSame = true;
        for (let j = 0; j < possibilities[i].length; j++) {
          if (possibilities[i][j] !== sameType) {
            isSame = false;
            break;
          }
        }
        if (isSame) {
          gameData[i] = sameType;
          forecasts = i;
          complete(i);
          return;
        }
      }
      showTips();
    } else {
      complete(index);
    }
  }
  function operate(type, node) {
    if (operateSelect != type) {
      operateSelect = type;
      selectElement.style = "";
      node.style = selectStyle;
      selectElement = node;
    }
  }
  function sortFunc(a, b) {
    return a - b;
  }
  //补全确定的图形  区分类型的原因是并不确定第一个点的会是什么
  function complete(index) {
    const type = gameData[index];
    for (let i = 0; i < allType.length; i++) {
      if (allType[i].indexOf(type) >= 0) {
        const offset = index - type;
        for (let j = 0; j < allType[i].length; j++) {
          gameData[allType[i][j] + offset] = allType[i][j];
          changeImg(allType[i][j] + offset);
        }
      }
    }
    showAllTips(type);
    if (possibilities[0].length === 1) {
      search();
    }
  }
  function changeImg(index) {
    const gameWrapper = document.getElementById("gameWrapper");
    const img = gameWrapper.children[index];
    const type = gameData[index];
    img.src = imgSrc[type];
  }
  function isSwordType(type) {
    return swordH.indexOf(type) >= 0 || swordV.indexOf(type) >= 0;
  }
  function isBoxType(type) {
    return box.indexOf(type) >= 0;
  }
  //显示出现频率最高的卡  默认剑
  function showTips(isSword = true) {
    showLog && console.log("showTips");
    let arr = [];
    for (let i = 0; i < possibilities.length; i++) {
      for (let j = 0; j < possibilities[i].length; j++) {
        if (isSword) {
          if (isSwordType(possibilities[i][j])) {
            if (!arr[i]) {
              arr[i] = 0;
            }
            arr[i]++;
          }
        } else {
          if (isBoxType(possibilities[i][j])) {
            if (!arr[i]) {
              arr[i] = 0;
            }
            arr[i]++;
          }
        }
      }
    }
    let max = 0;
    let index = -1;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i] > max) {
        max = arr[i];
        index = i;
      }
    }
    let left = Math.floor(index % 6) * 60 - 2;
    let top = Math.floor(index / 6) * 60 - 2;

    const drawWrapper = document.getElementById("drawWrapper");
    const div = document.createElement("div");
    div.className = "select-light";
    div.style = "left:" + left + "px;top:" + top + "px;";
    drawWrapper.appendChild(div);
  }
  //在排除了很多情况下展示出剩余所有的另一类型位置
  function showAllTips(data) {
    showLog && console.log("showAllTips type:", data);
    for (let i = 0; i < possibilities.length; i++) {
      let left = Math.floor(i % 6) * 60;
      let top = Math.floor(i / 6) * 60;
      for (let j = 0; j < possibilities[i].length; j++) {
        let type = possibilities[i][j];
        if (isSwordType(data)) {
          if (isBoxType(type)) {
            addImg(type, left, top);
          }
        } else if (isBoxType(data)) {
          if (isSwordType(type)) {
            addImg(type, left, top);
          }
        } else {
          if (possibilities[0].length === 1) {
            if (isSwordType(type) || isBoxType(type)) {
              addImg(type, left, top);
            }
          }
        }
      }
    }
  }
  function clearTips() {
    showLog && console.log("clearTips");
    const drawWrapper = document.getElementById("drawWrapper");
    for (let i = drawWrapper.children.length - 1; i >= 0; i--) {
      drawWrapper.removeChild(drawWrapper.children[i]);
    }
  }
  function addImg(type, left, top) {
    const drawWrapper = document.getElementById("drawWrapper");
    const img = document.createElement("img");
    img.className = "img-grid-child";
    img.src = imgSrc[type];
    if (type == 98 || type == 99) {
      img.style = "left:" + left + "px;top:" + top + "px;opacity: 1;";
    } else {
      img.style = "left:" + left + "px;top:" + top + "px;";
    }
    drawWrapper.appendChild(img);
  }
  //宗长,找到你了
  function search() {
    let num = 0;
    for (let i = 0; i < possibilities.length; i++) {
      if (possibilities[i] == 99 || possibilities == 98) {
        let left = Math.floor(i % 6) * 60;
        let top = Math.floor(i / 6) * 60;
        let img = addImg(99, left, top);
        num++;
      }
    }
    if (num == 0) {
      setTimeout(() => window.alert("这个图案中不会出现宗长"), 0);
    }
  }
