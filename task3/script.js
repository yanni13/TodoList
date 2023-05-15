const todoInputElement = document.querySelector('.todo-input');
const todoEnterBtn = document.querySelector('.enter');
const todoList = document.querySelector('.todo-list');
const completeAllBtn = document.querySelector('.complete-all-btn');
const leftItem = document.querySelector('.left-items');
const showAll = document.querySelector('.show-all-btn');
const showActive = document.querySelector('.show-active-btn');
const showCompleted = document.querySelector('.show-completed-btn');
const clearAll = document.querySelector('.clear-all-btn');//모두 삭제
const clock = document.querySelector('.todo-title');
const check = document.querySelector('.todo-item.checked .content');//체크박스 눌렀을때

function getTime() {//시계기능
    const time = new Date();
    const hour = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    //삼항연산자를 이용해서 현재 시분초가 한자리 수 일때, 두자리수로 표현할 수 있게 함.
    clock.innerHTML = `${hour < 10 ? `0${hour}`:hour} : ${minutes < 10 ? `0${minutes}`:minutes} : ${seconds < 10 ? `0${seconds}`:seconds}`
}

function init() {//새로고침하지 않아도 시간이 변할 수 있도록 하는 함수
    setInterval(getTime,1000);//1초마다 값을 변환한다.
}

init();


let todos = []; // todo를 모아놓은 객체 배열 {id, content, isCompleted}
let id = 1; // todo 객체의 id가 될 숫자

let isAllCompleted = false; // todos 속 모든 todo의 isCompleted가 true인지 저장하는 Boolean

let curType = 'all'; // 현재 필터값을 저장하는 string -> 'all', 'active', 'completed' 


// 현재 todos를 매개변수 newTodos로 바꿔주는 함수
const setTodos = (newTodos) => todos = newTodos; 

// 현재 todos 배열 전체를 반환하는 함수
const getAllTodos = () => {
    return todos;
} 

// 현재 input에 입력된 value를 가져와서 처리하는 함수 -> 키보드 enter, 버튼 클릭 2가지로 수행
const getInputValue = () => {
    // todoInputElement에 'enter'키가 "keypress"됐을 때, doTrimValue() 실행
    todoInputElement.addEventListener('keypress', (e) =>{
        if(e.key === 'Enter'){
            doTrimValue(e.target.value);
        }
    });
    // input 옆 enter 버튼을 'click'했을 때, doTrimValue() 실행
    todoEnterBtn.addEventListener('click', () =>{
        doTrimValue(todoInputElement.value);
    });
};

getInputValue();

// 앞뒤 공백 제거 후, 빈 문자열이 아닐 경우 pushTodos() 실행
const doTrimValue = (val) =>{ 
    const trimVal = String(val).trim(); // string으로 형 변환 후, 공백 제거
    if( trimVal !== ''){ 
        pushTodos(trimVal); // pushTodos()로 todos 배열에 추가하기
    }
    else{
        alert("내용을 입력 후 클릭하세요"); 
    }
    todoInputElement.value = ""; // input의 value 없애기(=버퍼비우기)
};

// todos 객체 배열에 객체 추가
const pushTodos = (context) =>{
    const newId = id++; // 아이디 할당
    const newTodos = [...todos, { id : newId, content : context, isCompleted : false }]; // 새로운 객체 배열 만들기, spread operator
    setTodos(newTodos); // setTodos()로 새로운 배열을 todos로 결정하기
    paintTodos(); // 갱신된 todos로 todo-list 작성하기
	setLeftItems(); // 남은 할일 계산하기
}

// 현재 todos에 있는 객체로 todo-list 작성하기
const paintTodos = ()=>{
    // 지금까지 list에 있던 li 요소를 지운다(안하면 기존 노드가 계속 쌓임)
    todoList.innerHTML = null;

    const allTodos = getAllTodos();
    allTodos.forEach(todo => paintFilterTodo(todo));
};

const paintFilterTodo = (todo) =>{
    // 감싸줄 li 태그 생성, 클래스명 추가
    const liElement = document.createElement('li');
    liElement.classList.add('todo-item');

    // check button
    const checkElement = document.createElement('button');
    checkElement.classList.add('checkbox');
    checkElement.innerHTML = "✔︎";
    checkElement.addEventListener('click', () => updateTodo(todo.id));
    

    // content
    const contentElement = document.createElement('div');
    contentElement.classList.add('content');
    contentElement.innerHTML = todo.content;
    contentElement.addEventListener('dblclick', (e)=> dbclickTodo(e, todo.id));

    // delete button
    const deleteElement = document.createElement('button');
    deleteElement.classList.add('delBtn');
    deleteElement.innerHTML = "✕";
    deleteElement.addEventListener('click', () => deleteTodo(todo.id));
    
    liElement.appendChild(checkElement);
    liElement.appendChild(contentElement);
    liElement.appendChild(deleteElement);

    // ul 태그에 현재 li 태그 합치기
    todoList.appendChild(liElement);

    // 현재 객체가 완료된 객체면 클래스로 checked 추가
    // 처음부터 써놓긴 했지만, 사실 이 때를 위한 코드였습니다.
    if(todo.isCompleted){
        liElement.classList.add('checked');
}

};

const setLeftItems = () => {
    const leftTodo = getAllTodos().filter(todo => todo.isCompleted == false);
    leftItem.innerHTML = `🥕 오늘 할 일이 ${leftTodo.length}개 남아있습니다 🥕`;
}

// todo-list에 input.edit-input 추가하기 (더블 클릭 이벤트)
const dbclickTodo = (e, todoId) => {
    const inputElement = document.createElement('input');
    inputElement.classList.add('edit-input');
    const content = e.target.innerHTML;
    inputElement.value = content;
    //상위태그를 가져온다.
    const curElement = e.target;
    const parentElement = curElement.parentNode;

    const clickBody = (e) => {
        if(e.target !== inputElement){
            parentElement.removeChild(inputElement);
        }
    }

    inputElement.addEventListener('keypress', (e)=>{
        if(e.key === "Enter"){
            if(String(e.target.value).trim() !== ""){
                updateTodo(e.target.value, todoId);
            }
            else{
                alert("현재 입력한 할 일이 없습니다!");
            }
        }
    });

    parentElement.appendChild(inputElement); // li 태그에 input 추가
    document.body.addEventListener('click', clickBody); // body에 click 이벤트 추가
}

// todos 객체 배열에서 할일 수정
const updateTodo = (content, todoId) => {
    const newTodos = getAllTodos().map(todo => (todo.id === todoId) ? {...todo, content} : todo );
    setTodos(newTodos);
    paintTodos();

}

const completeTodo = (todoId) => {
    const newTodos = getAllTodos().map(todo => (todo.id === todoId) ? {...todo, isCompleted : !todo.isCompleted} : todo);
    setTodos(newTodos);
    paintTodos();
    setLeftItems();
};

const deleteTodo = (todoId) => {//리스트 삭제
    const newTodos = getAllTodos().filter(todo => (todo.id !== todoId));
    setTodos(newTodos);
    paintTodos();
    setLeftItems();
};
