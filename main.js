const url = "http://localhost:5555"

tasks = [];
userId = 0;

async function main(){
    currentUsername = localStorage.getItem('currentUsername')||'';
    currentPassword = localStorage.getItem('currentPassword')||'';
    currentUserId = localStorage.getItem('currentUserId')||'';
    isLocal = (currentUsername=='');
    checkedId = [];
    const newTaskSubmit = this.document.getElementById('newTaskSubmit');
    const newTaskInput = document.getElementById('newTaskInput');
    searchText = document.getElementById('searchText');
    searchValue = searchText.value
    filter = document.getElementById('filter');
    allFilter = document.getElementById('all');
    activeFilter = document.getElementById('active');
    doneFilter = document.getElementById('done');
    currentPage = 1;
    const confirmDialogAll = document.getElementById('confirmDialogAll');
    const confirmDialogChecked = document.getElementById('confirmDialogChecked');
    if (!isLocal) {
        if (!await signIn(currentUsername, currentPassword)){
            alert("Failed to Sign In. Showing your local todolist");
            currentUsername = '';
            currentPassword = '';
            isLocal = true;
        } else {
            tasks = readTasks(currentUserId,currentPassword);
        }
    }
    if (isLocal) {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        DisplayList(tasks);
    }
    newTaskSubmit.addEventListener('click', function(e){
        e.preventDefault();
        if (newTaskInput.value==''){
            console.log('no task')
        } else {
            if (isLocal) {
                const task = {
                    content: newTaskInput.value,
                    done: false,
                }
                tasks.push(task);
                localStorage.setItem(filename,JSON.stringify(tasks));
                DisplayList(tasks);
            } else {
                addTask(currentUserId, currentPassword, newTaskInput.value);
                tasks = readTasks(currentUserId,currentPassword);
            }
        }
        newTaskInput.value='';
    });

    newTaskInput.addEventListener('keydown', function(e){
        if (e.keyIdentifier=='U+000A'||e.keyIdentifier=='Enter'||e.keyCode==13) {
            e.preventDefault();
            if (newTaskInput.value==''){
                console.log('no task')
            } else {
                if (isLocal) {
                    const task = {
                        content: newTaskInput.value,
                        done: false,
                    }
                    tasks.push(task);
                    localStorage.setItem('tasks',JSON.stringify(tasks));
                    DisplayList(tasks);
                } else {
                    addTask(currentUserId, currentPassword, newTaskInput.value);
                    tasks = readTasks(currentUserId,currentPassword);
                }
            }
            newTaskInput.value='';
            newTaskInput.focus();
        }
    })

    newTaskInput.addEventListener('blur', function() {
        if (newTaskInput.value==''){
            newTaskInput.placeholder="Enter new task...";
        }
    })

    filter.addEventListener('change', function(){
        DisplayList(tasks);
    })
    searchText.addEventListener('keyup', function(e){
        e.preventDefault();
        searchValue = removeVietnameseTones(searchText.value);
        DisplayList(tasks);
    })

    searchText.addEventListener('keydown', function(e){
        if (e.keyIdentifier=='U+000A'||e.keyIdentifier=='Enter'||e.keyCode==13) {
            e.preventDefault();
        }
    })

//May edit for potential removal of Done tasks
    this.document.getElementById('removeAll').addEventListener('click', function(){
        confirmDialogAll.showModal();
        confirmDialogAll.addEventListener('close', () => {
            if (confirmDialogAll.returnValue=="confirmBtn") {
                if (isLocal) {
                    tasks = [];
                    localStorage.removeItem('tasks');
                    DisplayList(tasks);
                } else {
                    removeTask(currentUserId, currentPassword, 'all');
                    tasks = readTasks(currentUserId, currentPassword);
                }
            }
        })
    })

    this.document.getElementById('removeChecked').addEventListener('click', function(){
        confirmDialogChecked.showModal();
        confirmDialogChecked.addEventListener('close', () => {
            if (confirmDialogChecked.returnValue=="confirmBtn") {
                if (!isLocal) {
                    removeTask(currentUserId, currentPassword, checkedId);
                    tasks = readTasks(currentUserId, currentPassword);
                }
            }
        })
    })
}

function DisplayList(tasksD) { 
    if (currentUsername == '') {
        currentName = 'Guest';
        document.getElementById('signInLink').style.display = 'inline';
        document.getElementById('logOutButton').style.display = 'none';
    } else {
        currentName = "Placeholder";
        document.getElementById('signInLink').style.display = 'none';
        document.getElementById('logOutButton').style.display = 'inline';
    }
    const welcome = document.getElementById('welcome');
    welcome.innerHTML = 'Welcome,&nbsp' + currentName;

    confirmDialogAll.returnValue = 'cancel';
    confirmDialogChecked.returnValue = 'cancel';
    checkedId =[];
    const itemPerPage = 10;

    const taskList = document.querySelector('#taskList');
    const pages = document.getElementById('pages');
    pages.innerHTML = '';

    var activeCount = 0;
    var doneCount = 0;
    taskList.innerHTML = '';
    if (doneFilter.checked) {
        filterDone = true;
    } else if (activeFilter.checked) {
        filterDone = false;
    } else {
        filterAll = true;
        console.log('check Filter');
    }
    var indexCount = 0;
    

    tasksD.forEach(task => {
        if (task.done) {
            doneCount++;
        } else {
            activeCount++;
        }
        
        if (!(allFilter.checked || task.done == filterDone)) {
            return;
        }

        if (!removeVietnameseTones(task.content).includes(searchValue)) {
            return;
        }

        indexCount++;
        if (indexCount<=(itemPerPage*(currentPage-1)) || indexCount>(itemPerPage*currentPage)) {
            return;
        }

        const taskEl = document.createElement('div');
        taskEl.classList.add('task');
        const checkBox = document.createElement('input');
        const content = document.createElement('div');
        const modify = document.createElement('div');
        const doneCheck = document.createElement('button');
        const edit = document.createElement('img');
        const remove = document.createElement('button');

        checkBox.type = 'checkbox';
        checkBox.classList.add('checkbox');

        if (task.done) {
            taskEl.classList.add('contentdone');
            doneCheck.innerHTML = 'Repeat';
            doneCheck.classList.add('repeat');
        } else {
            taskEl.classList.add('contentnotdone');
            doneCheck.innerHTML = 'Finish';
            doneCheck.classList.add('doneCheck');
        }

        modify.classList.add('modify');
        edit.classList.add('edit');
        edit.classList.add('button');
        remove.classList.add('remove');

        content.innerHTML = `<input type="text" class="text" value="${task.content}" readonly>`;
        edit.src = "pencil.png";
        edit.alt = "Edit";
        remove.innerHTML = 'Remove';
        
        modify.appendChild(doneCheck);
        modify.appendChild(edit);
        modify.appendChild(remove);
        taskEl.appendChild(checkBox);
        taskEl.appendChild(content);
        taskEl.appendChild(modify);

        taskList.appendChild(taskEl);

        if (isLocal) {
            document.getElementById('removeChecked').addEventListener('click', function(){
                if (checkBox.checked) {
                    confirmDialogChecked.addEventListener('close', () => {
                        if (confirmDialogChecked.returnValue=="confirmBtn") {
                            tasksD = tasksD.filter(t => t!=task);
                        }
                    localStorage.setItem('tasks',JSON.stringify(tasksD));
                    DisplayList(tasksD);
                    })                    
                }
            })
        } else {
            checkBox.addEventListener('change',function(){
                if (this.checked){
                    if (!checkedId.includes(task.id)){
                        checkedId.push(task.id);
                    }
                } else {
                    if (checkedId.includes(task.id)){
                        checkedId = checkedId.filter(id => id!=task.id);
                    }
                }
            })
        }
        doneCheck.addEventListener('click', function(e){
            task.done = !task.done;
            localStorage.setItem('tasks',JSON.stringify(tasksD));
            if (task.done) {
                content.classList.add('contentdone');
            } else {
                content.classList.add('contentnotdone');
            }
            DisplayList(tasksD);
        })

        edit.addEventListener('click', function(e){
            const input = content.querySelector('input');
            if (input.readOnly) {
                input.removeAttribute('readonly');
                input.focus();

                const save = document.createElement('button');
                save.classList.add('save');
                save.innerHTML = 'Save';
                const cancel = document.createElement('button');
                cancel.classList.add('cancel');
                cancel.innerHTML = 'Cancel';

                modify.innerHTML='';
                modify.appendChild(save);
                modify.appendChild(cancel);
                
                cancel.addEventListener('click', function(){
                    DisplayList(tasksD);
                })
                save.addEventListener('click', function(e1) {
                    input.setAttribute('readonly',true);
                    task.content = input.value;
                    localStorage.setItem('tasks',JSON.stringify(tasksD));
                    DisplayList(tasksD);
                })
            }     
            
            
        })
        remove.addEventListener('click', function(e){
            if (isLocal) {
                tasksD = tasksD.filter(t => t!=task);
                localStorage.setItem('tasks',JSON.stringify(tasksD));
                DisplayList(tasksD);
            } else {
                removeTask(currentUserId, currentPassword, task.id);
                tasks = readTasks(currentUserId, currentPassword);
            }
        })
    });
    if (indexCount>itemPerPage) {
        for (let i=0; i < Math.ceil(indexCount/itemPerPage); i++){
            const pageIndex = document.createElement('input');
            const pageLabel = document.createElement('label');
            const pageId = 'p'+(i+1);
            pageIndex.type = 'radio';
            pageIndex.id = pageId;
            pageIndex.name = pageId;
            pageIndex.value = '' + (i+1);
            if (i==currentPage-1) {
                pageIndex.setAttribute('checked',true);
            }

            pageLabel.htmlFor = pageId;
            pageLabel.innerHTML = '' + (i+1);
            pages.appendChild(pageIndex);
            pages.appendChild(pageLabel);

            pageIndex.addEventListener('click', function(e){
                currentPage = i+1;
                DisplayList(tasksD);
            })
        }
    }
    document.getElementById('activeText').innerText = activeCount + " to-do,";
    document.getElementById('doneText').innerText = doneCount + " done."
}



//https://gist.github.com/hu2di/e80d99051529dbaa7252922baafd40e3#file-convertvie-js
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
    // Remove extra spaces
    // Bỏ các khoảng trắng liền nhau
    str = str.replace(/ + /g," ");
    str = str.trim();
    // Remove punctuations
    // Bỏ dấu câu, kí tự đặc biệt
    str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    return str;
}

async function signInButton(e){
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const success = await signIn(username, password);
    if (success) {
        currentUsername = username;
        currentPassword = password;
        localStorage.setItem('currentUsername',currentUsername);
        localStorage.setItem('currentPassword',currentPassword);
        currentUserId = await getUserId(username, password);
        localStorage.setItem('currentUserId', currentUserId);
        location.href = "index.html";
        console.log('success');
    } else {
        const alert = document.createElement('p');
        const prompt = document.getElementById('alertPrompt');
        prompt.innerHTML = '';
        alert.innerHTML = 'Incorrect username and/or password';
        alert.classList.add('alert');
        prompt.appendChild(alert);
    }
}

async function signUpButton(e){
    e.preventDefault();
    const fullname = document.getElementById('fullname').value;
    const username = document.getElementById('username').value.toLowerCase();
    const password = document.getElementById('password').value;
    const matched = await signUp(fullname, username, password);
    if (matched) {
        const alert = document.createElement('p');
        const prompt = document.getElementById('alertPrompt');
        prompt.innerHTML = '';
        alert.innerHTML = 'Username already existed. Choose a new username or <a href="signin.html">Sign In</a>';
        alert.classList.add('alert');
        prompt.appendChild(alert);
    } else {
        document.querySelector('form').reset();
        document.getElementById('fullname').focus();
        const alert = document.createElement('p');
        const prompt = document.getElementById('alertPrompt');
        prompt.innerHTML = '';
        alert.innerHTML = 'Account created. <a href="signin.html">Sign In</a>.';
        alert.classList.add('alertBlue');
        prompt.appendChild(alert);
    }
}

function logOut(e){
    currentUsername = '';
    currentUserId = '';
    currentPassword = '';
    localStorage.setItem('currentUsername',currentUsername);
    localStorage.setItem('currentUserId',currentUserId);
    localStorage.setItem('currentPassword',currentPassword);
    isLocal = true;
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    DisplayList(tasks);
    e.preventDefault();
}

async function signUp(fullname,username,password) {
    let success = false;
    await $.post(url + "/register",{fullname: fullname, username: username, password: password}, function(data){
        console.log(data);
        if(data.toLowerCase() === 'usercreated' ) {
            success = true;
        } else if(data.toLowerCase() === 'userexisted' ) {
            console.log("Change username");
        } else {
            console.log("server error")
        }
    });
    return success;
}

async function signIn(username, password) {
    let success = false;   
    await $.post(url + "/login",{username: username, password: password}, function(data){
        console.log(data);
        if(data.toLowerCase() === 'loggedin' ) {
            console.log("Signed In");
            success = true;
        } else if(data.toLowerCase() === 'notauth' ) {
            console.log("Incorrect username/password");
        } else {
            console.log("server error")
        }
    });
    return success;
}

async function getUserId(username, password) {
    let uid = '';   
    await $.post(url + "/getuserid",{username: username, password: password}, function(data){
        console.log(data);
        if(data.toLowerCase() === 'notauth' ) {
            console.log("Incorrect username/password");
        } else {
            console.log(data);
            uid = data;
        }
    });
    return uid;
}

function addTask(userid, password, content){
    $.post(url + "/addtask",{userid: userid, password: password, content: content}, function(data){
        console.log(data);
        if(data.toLowerCase() === 'added' ) {
            console.log("Task Added");
        } else if(data.toLowerCase() === 'notauth' ) {
            console.log("Incorrect username/password");
        } else {
            console.log("server error")
        }
    });
}

function removeTask(userid, password, id){
    $.post(url + "/removetask",{userid: userid, password: password, id: JSON.stringify(id)}, function(data){
        console.log(data);
        if(data.toLowerCase() === 'removed' ) {
            console.log("Task Removed");
        } else if(data.toLowerCase() === 'notauth' ) {
            console.log("Incorrect Authentication");
        } else {
            console.log("server error")
        }
    });
}

async function readTasks(userid, password){
    tasksF = []
    await $.post(url + "/readtasks",{userid: userid, password: password}, function(data){
        console.log(data);
        tasksF = data;
    });
    console.log(tasksF);
    DisplayList(tasksF);
    return tasksF;
}