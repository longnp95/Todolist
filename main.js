window.addEventListener('load', function(){
    currentUsername = localStorage.getItem('currentUsername')||'';

    //if (!(this.location.href == 'index.html')) return;
    filename = 'tasks' + currentUsername;
    tasks = JSON.parse(localStorage.getItem(filename)) || [];
    const newTaskSubmit = this.document.getElementById('newTaskSubmit');
    const newTaskInput = document.getElementById('newTaskInput');
    searchText = document.getElementById('searchText');
    searchValue = searchText.value
    filter = document.getElementById('filter');
    allFilter = document.getElementById('all');
    activeFilter = document.getElementById('active');
    doneFilter = document.getElementById('done');
    currentPage = 1;

    const showButton = document.getElementById('showDialog');
    const confirmDialog = document.getElementById('confirmDialog');
    const outputBox = document.querySelector('output');

    DisplayList();
    newTaskSubmit.addEventListener('click', function(e){
        e.preventDefault();
        if (newTaskInput.value==''){
            console.log('no task')
        } else {
            const task = {
                content: newTaskInput.value,
                done: false,
            }
            tasks.push(task);
        }

        localStorage.setItem(filename,JSON.stringify(tasks));

        newTaskInput.value='';
        DisplayList();
    });

    newTaskInput.addEventListener('keydown', function(e){
        if (e.keyIdentifier=='U+000A'||e.keyIdentifier=='Enter'||e.keyCode==13) {
            e.preventDefault();
            if (newTaskInput.value==''){
                console.log('no task')
            } else {
                const task = {
                    content: newTaskInput.value,
                    done: false,
                }
                tasks.push(task);
            }
    
            localStorage.setItem(filename,JSON.stringify(tasks));
            newTaskInput.value='';
            DisplayList();
            newTaskInput.focus();
        }
    })

    newTaskInput.addEventListener('blur', function() {
        if (newTaskInput.value==''){
            newTaskInput.placeholder="Enter new task...";
        }
    })

    filter.addEventListener('change', function(){
        DisplayList();
    })
    searchText.addEventListener('keyup', function(e){
        e.preventDefault();
        searchValue = removeVietnameseTones(searchText.value);
        DisplayList();
    })

    searchText.addEventListener('keydown', function(e){
        if (e.keyIdentifier=='U+000A'||e.keyIdentifier=='Enter'||e.keyCode==13) {
            e.preventDefault();
        }
    })

//May edit for potential removal of Done tasks
/*     this.document.getElementById('removeChecked').addEventListener('click', function(){
        tasks.forEach(task => {
            if (task.done) {
                tasks = tasks.filter(t => t!=task);
            }
        });
        localStorage.setItem(filename,JSON.stringify(tasks));
        DisplayList();
    }) */
    this.document.getElementById('removeAll').addEventListener('click', function(){
        confirmDialog.showModal();
        confirmDialog.addEventListener('close', () => {
            if (confirmDialog.returnValue=="confirmBtn") {
                tasks = [];
                localStorage.removeItem(filename);
                DisplayList();
            }
        })
    })

    this.document.getElementById('removeChecked').addEventListener('click', function(){
        confirmDialog.showModal();
    })
     

});

function DisplayList() {
    filename = 'tasks' + currentUsername;
    tasks = JSON.parse(localStorage.getItem(filename)) || [];   

    if (currentUsername == '') {
        currentName = 'Guest';
        document.getElementById('signInLink').style.display = 'inline';
        document.getElementById('logOutButton').style.display = 'none';
    } else {
        const usersData = JSON.parse(localStorage.getItem('usersData')) || [];
        currentName = usersData.find(user => user.username.toLowerCase() == currentUsername).fullname;
        document.getElementById('signInLink').style.display = 'none';
        document.getElementById('logOutButton').style.display = 'inline';
    }
    const welcome = document.getElementById('welcome');
    welcome.innerHTML = 'Welcome,&nbsp' + currentName;

    confirmDialog.returnValue = 'cancel';
    const itemPerPage = 10;

    const taskList = document.querySelector('#taskList');
    const pages = document.getElementById('pages');
    pages.innerHTML = '';

    var activeCount = 0;
    var doneCount = 0;
    console.log(taskList);
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
    

    tasks.forEach(task => {
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

        document.getElementById('removeChecked').addEventListener('click', function(){
            if (checkBox.checked) {
                confirmDialog.addEventListener('close', () => {
                    if (confirmDialog.returnValue=="confirmBtn") {
                        tasks = tasks.filter(t => t!=task);
                    }
                localStorage.setItem(filename,JSON.stringify(tasks));
                DisplayList();
                })
                
            }
        })
        doneCheck.addEventListener('click', function(e){
            task.done = !task.done;
            localStorage.setItem(filename,JSON.stringify(tasks));
            if (task.done) {
                content.classList.add('contentdone');
            } else {
                content.classList.add('contentnotdone');
            }
            DisplayList();
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
                    DisplayList();
                })
                save.addEventListener('click', function(e1) {
                    input.setAttribute('readonly',true);
                    task.content = input.value;
                    localStorage.setItem(filename,JSON.stringify(tasks));
                    DisplayList();
                })
            }     
            
            
        })
        remove.addEventListener('click', function(e){
            tasks = tasks.filter(t => t!=task);
            localStorage.setItem(filename,JSON.stringify(tasks));
            DisplayList();
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
                DisplayList();
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

function signIn(e){
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const usersData = JSON.parse(localStorage.getItem('usersData')) || [];
    const matched = usersData.length && usersData.some(user => user.username.toLowerCase() == username && user.password == password);
    if (matched) {
        currentUsername = username;
        localStorage.setItem('currentUsername',currentUsername);
        location.href = "index.html";
    } else {
        const alert = document.createElement('p');
        const prompt = document.getElementById('alertPrompt');
        prompt.innerHTML = '';
        alert.innerHTML = 'Incorrect username and/or password';
        alert.classList.add('alert');
        prompt.appendChild(alert);
    }
    e.preventDefault();
}

function signUp(e){
    const fullname = document.getElementById('fullname').value;
    const username = document.getElementById('username').value.toLowerCase();
    const password = document.getElementById('password').value;
    const usersData = JSON.parse(localStorage.getItem('usersData')) || [];
    const matched = usersData.length && usersData.some(user => user.username.toLowerCase() == username);
    if (matched) {
        const alert = document.createElement('p');
        const prompt = document.getElementById('alertPrompt');
        prompt.innerHTML = '';
        alert.innerHTML = 'Username already existed. Choose a new username or <a href="signin.html">Sign In</a>';
        alert.classList.add('alert');
        prompt.appendChild(alert);
    } else {
        usersData.push({ fullname, username, password});
        localStorage.setItem('usersData', JSON.stringify(usersData));
        document.querySelector('form').reset();
        document.getElementById('fullname').focus();
        const alert = document.createElement('p');
        const prompt = document.getElementById('alertPrompt');
        prompt.innerHTML = '';
        alert.innerHTML = 'Account created. <a href="signin.html">Sign In</a>.';
        alert.classList.add('alertBlue');
        prompt.appendChild(alert);
    }
    e.preventDefault();
}

function logOut(e){
    currentUsername = '';
    localStorage.setItem('currentUsername',currentUsername);
    DisplayList();
    e.preventDefault();
}