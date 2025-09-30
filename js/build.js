
export const ServerData = new(function(){
    this.getKey = function(object,value){ //Get Array keys
        return Object.keys(object).find(key => object[key] == value);
    };
    this.getAge = function(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    this.bindAuth = async function(extra){
        let { method, body, header, link, data, way, load, r } = extra
        let pop = { method }
        if(!load)
            this.pausePage({ 'msg' : 'loading...', 'run' : true, 'timer' : false, 'confirm' : false })
        if(method == "POST")
            if(!way)
                pop.body = JSON.stringify(body)
            else
                pop.body = body
        if(header)
            pop.headers = { 'Content-type': 'application/json; charset=UTF-8' }

        try {
            const response = await fetch( link, pop );

            if(!load)
                    this.pausePage({ 'run' : false,  'msg' : 'loading...', 'timer' : false, 'confirm' : false })
            if(data == 'json')
                return await response.json();
            if(data == 'text')
                return await response.text();

        } catch (error) {
            console.error(error);
            console.log([link, body]);
        }
    };
    this.spin = async(data) => {
        const { link, id, speed } = data
        const three_dimension = await this.bindAuth( { 'method' : 'GET', 'link' : `${ link }`, 'header' : false, 'data' : 'json', 'load' : true })
        if(three_dimension){
            let k = 0;
            setInterval(
                function(){
                    document.querySelector(id).src = three_dimension.header + '' + three_dimension.spinner[k]
                    k++
                    if(k == 4)
                        k = 0
                },speed
            )
        }else
            this.pausePage({ 'msg' : 'Request Timeout', 'timer' : 'fast', 'run' : true, 'confirm' : false })
    };
    this.pausePage = function(c){
        let { msg, timer, run, confirm } = c
        let a = msg.split('.').map( p =>  `<h3>${ p }</h3>` )
        if(run){
            let p = `<img id = 'pause-dimension' src = 'Images/load.gif' class = 'load-pause' >
                            <div id = 'input-div-internal'>
                                ${ a.join('.') }`
                                if(confirm){
                                    p += `<button id = 'nowGo'>
                                        OK
                                    </button>`
                                }
                            p += `</div>`
            $('#pauseWindow').remove()
            const wall = document.createElement('div')
            wall.setAttribute("id", 'pauseWindow');
            wall.innerHTML = p
            document.getElementById('build').appendChild(wall)
            if(confirm){
                $('#pauseWindow').css('display','flex')
                $('#pauseWindow').css('flexDirection','row')
            }
            $('#pauseWindow').fadeIn('slow')
            if(timer){
                if(timer == 'fast')
                    timer = 500
                if(timer == 'slow')
                    timer = 4000
                setTimeout(
                    function(){
                        $('#pauseWindow').fadeOut()
                    },
                     timer
                );
            }
        }else{
            $('#pauseWindow').fadeOut()
        }
    };
})() // New class


const createGraph = (g) => {
    const { graph_data, id, text } = g
    let dateValue = graph_data.map( b => b.date );
    let countValue = graph_data.map( b => Number(b.count) );
    var barColors = [ "red", "green", "blue", "orange", "brown" ];
    new Chart(id, {
        type : "bar",
        data : {
            labels : dateValue,
            datasets : [{
              backgroundColor : barColors,
              data : countValue
            }]
        },
        options : {
            responsive : true,
            title : {
                display : true,
                text,
                fontSize :20
            },

            tooltips : {
                    mode : 'index',
                    intersect: true
            },
            animation : {
                animateScale : true,
                animateRotate : true
            }
        }
    });
}

function formatState (state) {
/*  if (!state.id) {
    return state.text;
  }

  var baseUrl = "/user/pages/images/flags";
  var $state = $(
    '<span><img class="img-flag" /> <span></span></span>'
  );

  // Use .text() instead of HTML string concatenation to avoid script injection issues
  $state.find("span").text(state.text);
  $state.find("img").attr("src", baseUrl + "/" + state.element.value.toLowerCase() + ".png");

  return $state;
  */

};

const buildSelect = (e) => {
    let { id, placeholder, data } = e

    $(id).select2({
        placeholder : placeholder,
        tags : true,
        //templateSelection : formatState,
        data : data.select
    }).on('select2:close', function(){
        var element = $(this);
        var new_category = $.trim(element.val());
        ServerData.selected = true;
        if(new_category != '') //If not in DB
            element.append('<option value="'+new_category+'">'+new_category+' Not in Database</option>').val(new_category);

    });
}

const plotView = async(e) => {
    let { channel, select_id, view_id, panel, placeholder } = e

    let all_data = {};
    if(channel == 1)
        all_data = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'hospital_name' : true }, 'data' : 'json' })

    if(channel == 2)
        all_data = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'doctor_name' : true }, 'data' : 'json' })

    if(channel == 3)
        all_data = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'record_name' : true }, 'data' : 'json' })

    buildSelect({'id' : '#' + select_id, 'placeholder' : placeholder, 'data' : all_data })

    let main_build = () => {
        if(channel == 1)
            return 'hospital_id'
        if(channel == 2)
            return 'doctor_id'
    }

    function if_length(){
        if(all_data.all.length > 0){
            if(channel == 1 || channel == 2){

              let string_data = all_data.all.map( h =>
                        `<section id = '${ main_build }' style = 'width : 96%; height:250px; margin:2%;'>
                            <img src = '${ h.Image }' style = 'float:left;width:50%;height:100%;'>
                            <div id = 'input-div' style = 'width : 50%'>
                                <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                                    <i class='fas fa-user-check'></i>
                                    <p>${ h.Name }</p>
                                </div>
                                <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                                    <i class='fas fa-user-clock'></i>
                                    <p>${ h.Address || ServerData.getAge(h.Age) }</p>
                                </div>
                            </div>
                            <div id = 'input-div' style = 'width : 50%'>
                                <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                                   <i class='fas fa-phone'></i>
                                   <p>${ h.Telephone }</p>
                                </div>
                                <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                                   <i class='fas fa-at'></i>
                                   <p>${ h.Email }</p>
                                </div>
                            </div>

                        </section>
                            `
              )
              return string_data
            }
            if(channel == 3){
                let record_string = all_data.all.map( h =>
                    `<section id = 'record_id'>
                        <div id = 'input-div'>
                            <div id = 'input-div-internal' style = 'width:100%;background:#fff;'>
                                <i class='fas fa-home'></i>
                                <p>${ h.Sickness }</p>
                            </div>
                        </div>
                        <div id = 'input-div'>
                            <div id = 'input-div-internal'>
                               <i class='fas fa-home'></i>
                               <p>${ h.DoctorName }</p>
                            </div>
                            <div id = 'input-div-internal'>
                               <i class='fas fa-home'></i>
                               <p>${ h.HospitalName }</p>
                            </div>
                        </div>
                    </section>`
                )
                if(all_data.package == "GOLD"){
                    record_string = all_data.all.map( h =>
                            `<section id = 'record_id'>
                                <div id = 'input-div'>
                                    <div id = 'input-div-internal' style = 'width:100%;background:#fff;'>
                                        <i class='fas fa-home'></i>
                                        <p>${ h.Sickness }</p>
                                    </div>
                                </div>
                                <div id = 'input-div'>
                                    <div id = 'input-div-internal' style = 'width:100%;background:#fff;'>
                                        <i class='fas fa-home'></i>
                                        <p>${ h.Symptoms }</p>
                                    </div>
                                </div>
                                <div id = 'input-div'>
                                    <div id = 'input-div-internal' style = 'width:100%;background:#fff;'>
                                        <i class='fas fa-home'></i>
                                        <p>${ h.Treatment }</p>
                                    </div>
                                </div>
                                <div id = 'input-div'>
                                    <div id = 'input-div-internal' style = 'width:100%;background:#fff;'>
                                        <i class='fas fa-home'></i>
                                        <p>${ h.Medicine }</p>
                                    </div>
                                </div>
                                <div id = 'input-div'>
                                    <div id = 'input-div-internal'>
                                       <i class='fas fa-home'></i>
                                       <p>${ h.DoctorName }</p>
                                    </div>
                                    <div id = 'input-div-internal'>
                                       <i class='fas fa-home'></i>
                                       <p>${ h.HospitalName }</p>
                                    </div>
                                </div>
                                <div id = 'input-div'>
                                    <a href = 'h.Image' download style = 'background:#98fb98;height:40px;width:150px;'>Download x-ray</a>
                                </div>
                            </section>
                                `
                    )
                }
                if(all_data.package == "SILVER"){
                    record_string = all_data.all.map( h =>
                            `<section id = 'record_id'>
                                <div id = 'input-div'>
                                    <div id = 'input-div-internal' style = 'width:100%;background:#fff;'>
                                        <i class='fas fa-home'></i>
                                        <p>${ h.Sickness }</p>
                                    </div>
                                </div>
                                <div id = 'input-div'>
                                    <div id = 'input-div-internal' style = 'width:100%;background:#fff;'>
                                        <i class='fas fa-home'></i>
                                        <p>${ h.Medicine }</p>
                                    </div>
                                </div>
                                <div id = 'input-div'>
                                    <div id = 'input-div-internal'>
                                       <i class='fas fa-home'></i>
                                       <p>${ h.DoctorName }</p>
                                    </div>
                                    <div id = 'input-div-internal'>
                                       <i class='fas fa-home'></i>
                                       <p>${ h.HospitalName }</p>
                                    </div>
                                </div>
                                <div id = 'input-div'>
                                    <a href = 'h.Image' download style = 'background:#98fb98;height:40px;width:150px;'>Download x-ray</a>
                                </div>
                            </section>
                                `
                    )
                }
                return record_string
            }
        }else{
             return `<img src = 'Images/undraw_lost_re_xqjt.svg' class = 'avatar-undraw'>
             <h3>No ${ panel } enlisted in the Database</h3>`
        }
    }
    const bit = if_length();
    $(view_id).html(bit)
}

//Get data from backend to profile wall with virtual storage
export const retrieveContent = async(user,content,retrieve) => {
    let string = ServerData.bind_string

    document.querySelectorAll('#hospital').forEach( (h,k) => {
        if(k == content){
            h.style.textDecoration = "underline"
            h.style.background = "#fff"
        }else{
            h.style.textDecoration = "none"
            h.style.background = "#F7F8FB"
        }
    })
    if(user == 1)
        $('#main-focus').html(string.account.user.draft[content])
    else
        $('#main-focus').html(string.account.admin.draft[content])


    if(retrieve == 0){
        let obtain_plot = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : false, 'body' : { 'profile' : true }, 'data' : 'json'})

        let c = obtain_plot.users[0];

        document.getElementById('profile-img').src = c.Image
        $('#profile-name').val(c.Name)
        $('#profile-email').val(c.Email)
        $('#profile-telephone').val(c.Telephone)
        $('#profile-age').val(ServerData.getAge(c.Age))
        $('#profile-password').val(c.Password)
        $('#profile-gender').val(c.Gender)
        $('#package_poll').html(`Package : ${ obtain_plot.package }`)

    }
    if(retrieve == 2)
        plotView({ 'channel' : 1, 'select_id' : 'view_hospital', 'view_id' : '#view_hospitals', 'panel' : 'Hospitals', 'placeholder' : 'Search Hospital Here...'})

    if(retrieve == 4)
        plotView({ 'channel' : 2, 'select_id' : 'view_doctor', 'view_id' : '#view_doctors', 'panel' : 'Doctors', 'placeholder' : 'Search Doctor Here...'})

    if(retrieve == 5){
        let all_hospital = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'hospital_name' : true }, 'data' : 'json' })
        $('#Get_doctor_age').datepicker({
            dateFormat : 'yy-mm-dd',
            showAnim: 'slideDown',
           changeMonth: true,
           changeYear: true
        });
        buildSelect({'id' : '#Get_doctor_h_name', 'placeholder' : 'Hospital Doctor Works...', 'data' : all_hospital })

    }
    if(retrieve == 6)
        plotView({ 'channel' : 3, 'select_id' : 'view_record', 'view_id' : '#view_records', 'panel' : 'Records', 'placeholder' : 'Search Record Here...'})

    if(retrieve == 7){
        let all_hospital = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'hospital_name' : true }, 'data' : 'json' })

        buildSelect({'id' : '#hospital-record', 'placeholder' : 'Hospital...', 'data' : all_hospital })

        let all_doctor = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'doctor_name' : true }, 'data' : 'json' })

        buildSelect({'id' : '#doctor-record', 'placeholder' : 'Doctor...', 'data' : all_doctor })
    }
    if(retrieve == 8){
        [
            {'go_table' : '2','go_id' : 'patient-graph','go_text' : 'Number of Patients Against The Days'},
            {'go_table' : '1','go_id' : 'doctor-graph','go_text' : 'Number of Doctors Engaged Over The Days'},
            {'go_table' : '0','go_id' : 'records-graph','go_text' : 'New Records Against The Days'},
            {'go_table' : '3','go_id' : 'hospital-graph','go_text' : 'New Hospital Against The Days'}
        ].map( async(p) => {
            const { go_table, go_id, go_text } = p
            let graph_data = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : true, 'body' : { 'graph' : true, 'table' : go_table }, 'data' : 'json' })
            createGraph({'graph_data' : graph_data, 'id' : go_id, 'text' : go_text })
        })
    }
    if(retrieve == 9){
        let all_hospital = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'hospital_name' : true }, 'data' : 'json' })

        buildSelect({'id' : '#delete-hospital-view', 'placeholder' : 'Hospital...', 'data' : all_hospital })

    }
    if(retrieve == 10){
        let all_doctor = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'doctor_name' : true }, 'data' : 'json' })

        buildSelect({'id' : '#delete-doctor-view', 'placeholder' : 'Doctor...', 'data' : all_doctor })

    }
}

export const apply_package = async(e) => {

    let apply = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : false, 'body' : { 'apply' : true, 'data' : e.currentTarget.attributes[1].value }, 'data' : 'json'})

    if(apply.package)
        hospitalContent([5])
}

export const search_hospital = async(e) => {
    const hospital = $('#view_hospital').val().split(',')[1];
    let hospital_id = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : false, 'body' : { 'hospital_search' : true, 'data' : hospital }, 'data' : 'json'})
    if(hospital_id){
        if(hospital_id.hospital){
            let hospital_string = hospital_id.hospital.map( h =>
                `<section style = 'width : 96%; height:250px; margin:2%;'>
                    <img src = '${ h.Image }' style = 'float:left;width:50%;height:100%;'>
                    <div id = 'input-div' style = 'width : 50%'>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                            <i class='fas fa-user-check'></i>
                            <p>${ h.Name }</p>
                        </div>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                            <i class='fas fa-user-clock'></i>
                            <p>${ h.Address }</p>
                        </div>
                    </div>
                    <div id = 'input-div' style = 'width : 50%'>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                           <i class='fas fa-phone'></i>
                           <p>${ h.Telephone }</p>
                        </div>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                           <i class='fas fa-at'></i>
                           <p>${ h.Email }</p>
                        </div>
                    </div>

                </section>
                    `
            )
            $('#view_hospitals').html(hospital_string.join(','))
        }
    }else
        ServerData.pausePage({ 'msg' : 'Request Timeout. Try again', 'run' : true, 'timer' : 'fast', 'confirm' : false })
}
export const search_doctor = async(e) => {
    const doctor = $('#view_doctor').val().split(',')[1];
    let doctor_id = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : false, 'body' : { 'doctor_search' : true, 'data' : doctor }, 'data' : 'json'})
    if(doctor_id){
        if(doctor_id.doctor){
            let doctor_string = doctor_id.doctor.map( h =>
                `<section style = 'width : 96%; height:250px; margin:2%;'>
                    <img src = '${ h.Image }' style = 'float:left;width:50%;height:100%;'>
                    <div id = 'input-div' style = 'width : 50%'>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                            <i class='fas fa-user-check'></i>
                            <p>${ h.Name }</p>
                        </div>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                            <i class='fas fa-user-clock'></i>
                            <p>${ ServerData.getAge(h.Age) }</p>
                        </div>
                    </div>
                    <div id = 'input-div' style = 'width : 50%'>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                           <i class='fas fa-phone'></i>
                           <p>${ h.Telephone }</p>
                        </div>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                           <i class='fas fa-at'></i>
                           <p>${ h.Email }</p>
                        </div>
                    </div>

                </section>
                    `
            )
            $('#view_doctors').html(doctor_string.join(','))
        }
    }else
        ServerData.pausePage({ 'msg' : 'Request Timeout. Try again', 'run' : true, 'timer' : 'fast', 'confirm' : false })
}
export const search_records = async(e) => {
    const record = $('#view_records').val().split(',')[1];
    let record_id = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : false, 'body' : { 'records_search' : true, 'data' : record }, 'data' : 'json'})
    if(record_id){
        if(record_id.record){
            let record_string = record_id.record.map( h =>
                `<section style = 'width : 96%; height:250px; margin:2%;'>
                    <img src = '${ h.Image }' style = 'float:left;width:50%;height:100%;'>
                    <div id = 'input-div' style = 'width : 50%'>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                            <i class='fas fa-user-check'></i>
                            <p>${ h.Name }</p>
                        </div>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                            <i class='fas fa-user-clock'></i>
                            <p>${ ServerData.getAge(h.Age) }</p>
                        </div>
                    </div>
                    <div id = 'input-div' style = 'width : 50%'>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                           <i class='fas fa-phone'></i>
                           <p>${ h.Telephone }</p>
                        </div>
                        <div id = 'input-div-internal' style = 'width:48%;margin:1%;background:#fff;'>
                           <i class='fas fa-at'></i>
                           <p>${ h.Email }</p>
                        </div>
                    </div>

                </section>
                    `
            )
            $('#view_records').html(record_string.join(','))
        }
    }else
        ServerData.pausePage({ 'msg' : 'Request Timeout. Try again', 'run' : true, 'timer' : 'fast', 'confirm' : false })
}
export const hospital_add = async(e) => {
    const telephone = $('#Get_h_telephone').val();
    const email = $('#Get_h_email').val();
    const name = $('#Get_name').val();
    const address = $('#Get_h_address').val();
    const img = document.getElementById('hospital-file').files[0]

    if(!telephone || !email || !name || !address || !img){
        let m = ``
        if(!telephone)
            m += `Please Input a valid telephone<br>`
        if(!email)
            m += `Please Input a valid email<br>`
        if(!name)
            m += `Please Input a valid name<br>`
        if(!address)
            m += `Please Input a valid address<br>`
        if(!img)
            m += `Please Input a valid image<br>`
        ServerData.pausePage({ 'msg' : m, 'timer' : false, 'run' : true, 'confirm' : true })
    }else{
        const frmD = new FormData();
        frmD.append('create-hospital',true)
        frmD.append('name',name)
        frmD.append('img',img)
        frmD.append('telephone',telephone)
        frmD.append('email',email)
        frmD.append('address',address)
        let hospital = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : false, 'body' : frmD, 'data' : 'json', 'way' : true })
        if(hospital)
            retrieveContent(1,3,3)
    }
}
export const doctor_add = async(e) => {
    const telephone = $('#Get_doctor_telephone').val();
    const email = $('#Get_doctor_email').val();
    const name = $('#Get_doctor_name').val();
    const hospital_count = $('#Get_doctor_h_name').val().split(',')[0];
    const hospital_name = $('#Get_doctor_h_name').val().split(',')[1];
    const gender = $('#Get_doctor_gender').val();
    const age = $('#Get_doctor_age').val();
    const img = document.getElementById('doctor-file').files[0]

    if(!gender || !hospital_name || !telephone || !email || !name || !age || !img){
        let m = ``
        if(!gender)
            m += `Please Input a valid gender<br>`
        if(!hospital_name)
            m += `Please Input a valid hospital name<br>`
        if(!telephone)
            m += `Please Input a valid telephone<br>`
        if(!email)
            m += `Please Input a valid email<br>`
        if(!name)
            m += `Please Input a valid name<br>`
        if(!age)
            m += `Please Input a valid age<br>`
        if(!img)
            m += `Please Input a valid image<br>`
        ServerData.pausePage({ 'msg' : m, 'timer' : false, 'run' : true, 'confirm' : true })
    }else{

        const frmD = new FormData();
        frmD.append('create-doctor',true)
        frmD.append('name',name)
        frmD.append('img',img)
        frmD.append('telephone',telephone)
        frmD.append('email',email)
        frmD.append('hospital',hospital_name)
        frmD.append('gender',gender)
        frmD.append('age',age)
        frmD.append('count',hospital_count)
        let hospital = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : false, 'body' : frmD, 'data' : 'json', 'way' : true })
        if(hospital)
            retrieveContent(1,5,5)
    }
}
export const delete_hospital = async() => {
    const id = $('#delete-hospital-view').val().split(',')[0];
    let msg = `Please Select One Hospital`
    if(ServerData.selected){
        let hospital = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'destroy_hospital' : true, 'id' : id }, 'data' : 'json' })
        if(hospital)
            msg = `Hospital Destroyed Successfully`
        else
            msg = `Deletion Error`

    }
    ServerData.pausePage({ 'msg' : msg, 'timer' : true, 'run' : true, 'confirm' : false })
}
export const delete_doctor = async() => {
    const id = $('#delete-doctor-view').val().split(',')[0];
    let msg = `Please Select One Doctor`
    if(ServerData.selected){
        let doctor = await ServerData.bindAuth({ 'method' : 'POST', 'link' : 'php/index.php', 'header' : true, 'body' : { 'destroy_doctor' : true, 'id' : id }, 'data' : 'json' })
        if(doctor)
            msg = `Doctor Removed Successfully`
        else
            msg = `Deletion Error`

    }
    ServerData.pausePage({ 'msg' : msg, 'timer' : true, 'run' : true, 'confirm' : false })
}
export const record_add = async(e) => {
    const sickness = $('#sickness').val();
    const symptoms = $('#symptoms').val();
    const medicine = $('#medicine').val();
    const treatment = $('#treatment').val();
    const doctor_record = $('#doctor-record').val().split(',')[1];
    const doctor_count = $('#doctor-record').val().split(',')[0];
    const sickness_record = $('#hospital-record').val().split(',')[1];
    const hospital_count = $('#hospital-record').val().split(',')[0];


    if(!sickness || !symptoms || !medicine || !treatment || !doctor_record || !sickness_record){
        let m = ``
        if(!sickness)
            m += `Please Input sickness<br>`
        if(!symptoms)
            m += `Please Input symptoms<br>`
        if(!medicine)
            m += `Please Input medicine<br>`
        if(!treatment)
            m += `Please Input treatment<br>`
        if(!doctor_record)
            m += `Please select a doctor<br>`
        if(!sickness_record)
            m += `Please select hospital<br>`
        ServerData.pausePage({ 'msg' : m, 'timer' : false, 'run' : true, 'confirm' : true })
    }else{
        const img = document.getElementById('record-file').files[0]
        const frmD = new FormData();
        frmD.append('create-record',true)
        frmD.append('sickness',sickness)
        frmD.append('symptoms',symptoms)
        frmD.append('medicine',medicine)
        frmD.append('treatment',treatment)
        frmD.append('doctor_record',doctor_record)
        frmD.append('sickness_record',sickness_record)
        frmD.append('count',hospital_count)
        frmD.append('doctor',doctor_count)
        let hospital = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : false, 'body' : frmD, 'data' : 'json', 'way' : true })
        if(hospital)
            retrieveContent(1,7,7)
    }
}
export const go_away = async(e) => {
    let out = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : false, 'body' : { 'out' : true }, 'data' : 'json'})
    if(out.command){
        ServerData.pausePage({ 'msg' : 'Signed Out', 'run' : true, 'timer' : 'slow', 'confirm' : false })
        window.location.assign('index.html')
    }
}
export const delete_user = async(e) => {
    let destroy = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : false, 'body' : { 'destroy' : true }, 'data' : 'json'})
    if(destroy.command){
        ServerData.pausePage({ 'msg' : 'Account Destroyed!', 'run' : true, 'timer' : 'slow', 'confirm' : false })
        window.location.assign('index.html')
    }
}

export const createAccount = async(e) => {
    const f_name = $('#Get_fname').val();
    const l_name = $('#Get_lname').val();
    const password = $('#Get_password').val();
    const r_password = $('#Get_r_password').val();
    const telephone = $('#Get_telephone').val();
    const email = $('#Get_email').val();
    const age = $('#Get_age').val();
    const gender = $('#Get_gender').val();
    const img = document.getElementById('pro-file').files[0]

    if(!gender ||!img ||!age ||!f_name || !l_name || !telephone || !email || !password || !r_password){
        if(!telephone) $('#Get_telephone').css('borderBottom','2px solid red');
        if(!email) $('#Get_email').css('borderBottom','2px solid red');
        if(!age) $('#Get_age').css('borderBottom','2px solid red');
        if(!password) $('#Get_password').css('borderBottom','2px solid red');
        if(!f_name) $('#Get_fname').css('borderBottom','2px solid red');
        if(!l_name) $('#Get_lname').css('borderBottom','2px solid red');
        if(!gender) $('#Get_gender').css('borderBottom','2px solid red');
        if(!password) $('#Get_password').css('borderBottom','2px solid red');
        if(!r_password) $('#Get_r_password').css('borderBottom','2px solid red');
        if(!img) alert('Upload photo')
    }else{
        const frmD = new FormData();
        frmD.append('create',true)
        frmD.append('name',`${ f_name }, ${l_name}`)
        frmD.append('img',img)
        frmD.append('password',password)
        frmD.append('telephone',telephone)
        frmD.append('email',email)
        frmD.append('age',age)
        frmD.append('gender',gender)
        let create = await ServerData.bindAuth({'method' : 'POST', 'link' : `php/index.php`, 'header' : false, 'body' : frmD, 'data' : 'json', 'way' : true })
        if(create){
            $('#feedback').append(create.feedback)
            if(create.success)
                setTimeout(
                    function(){
                        window.location.assign('#log-in')
                    },2000
                )
        }else
            ServerData.pausePage({ 'msg' : 'Request Timeout. Try again', 'run' : true, 'timer' : 'fast', 'confirm' : false })
    }
}
export const ulog = async(e) => {
    const telephone = $('#GetTel').val();
    const password = $('#getIfno').val();
    if(!password || !telephone){
        if(!telephone) $('#GetTel').css('borderBottom','2px solid red');
        if(!password) $('#getIfno').css('borderBottom','2px solid red');
    }else{
        let logIn = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : true, 'body' : { 'login' : true, 'email' : telephone, 'password' : password }, 'data' : 'json' })
        if(logIn){
            $('#feedback').html(logIn.feedback)
            sessionStorage.setItem('user',logIn.admin)
            if(logIn.identity){
                setTimeout(
                    function(){
                        window.location.assign('account/index.html')
                    },2000
                )
            }
        }
    }
}

export const hospitalContent = async(no_panel) => {
    let login = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : true, 'body' : { 'user' : true }, 'data' : 'json' })
    if(login){
        let string = await ServerData.bindAuth({ 'method' : 'GET', 'link' : `json/string.json`, 'header' : true, 'data' : 'json', 'load' : true })
        if(string){
            ServerData.bind_string = string
            //Build : main bar
            if(no_panel.includes(3))
                $('#main-bar').html(string.content.main_bar)

            //Build : Home Page
            if(no_panel.includes(1)){
                $('#Home').html(string.content.home)
                ServerData.home = (ServerData.home) ? Number(ServerData.home) : 0 ;
                setInterval(
                    function(){
                        $('#wall' + ServerData.home).fadeOut('slow');
                        if(ServerData.home == 3)
                            ServerData.home = 1;
                        else
                            ServerData.home++
                        $('#wall' + ServerData.home).fadeIn('slow');
                    },4000
                );
                (function($, window, document, undefined) {

                    $.fn.slider = function() {
                        return this.each(function(options) {

                            var that = $(this);

                            var defaults = {
                                start_timeout: 1500,
                                slide_animation : 3000,
                                speed_of_effects : 1.3,
                                delay_of_effects : 0.2
                            };

                            var options = $.extend(defaults, options);

                            var obj = {
                                slides : $(that).find('li'),
                                start : false,
                                clips_number : 8,
                                first_slide : function() {
                                    return this.slides.eq(0);
                                },
                                start_clip_slide : function() {
                                    return this.slides.eq(1);
                                },
                                loop : function loop(next_slide) {

                                        for (var i = 0; i < obj.clips_number; i++) {

                                            if(obj.start == false) {
                                                obj.start_clip_slide().css({
                                                    'zIndex': 1,
                                                    'display': 'block'
                                                });
                                            }

                                            var canvas_element = $('<canvas>').attr({
                                                id: 'canvasID_' + ( i + 1 ),
                                                class: 'canvasClass'
                                            }).attr({
                                                width: 100,
                                                height: 500
                                            }).css('left', 100 * i);

                                            if(obj.start == false) {
                                                canvas_element.appendTo(obj.start_clip_slide());
                                            } else {
                                                canvas_element.appendTo(next_slide);
                                            }

                                            var canvas = $('#canvasID_' + (i + 1))[0];

                                            var ctx = canvas.getContext('2d');
                                            ctx.mozImageSmoothingEnabled = false;
                                            ctx.webkitImageSmoothingEnabled = false;
                                            ctx.msImageSmoothingEnabled = false;
                                            ctx.imageSmoothingEnabled = false;

                                            var img = document.createElement('img');
                                            var img_src = obj.start_clip_slide().find('img').attr('src');
                                            if(obj.start)
                                                img_src = next_slide.find('img').attr('src');


                                            img.src = img_src;

                                            ctx.drawImage(img, 100 * i, 0, 100, 500, 0, 0, 100, 500);

                                        }

                                },
                                animation :  function animation() {

                                    if(obj.start == false) {
                                        obj.loop();
                                    }
                                    obj.start = true;

                                    var tl = new TimelineMax();

                                    tl.add( TweenMax.set('.canvasClass', {top: -500}) );
                                    tl.add( TweenMax.staggerTo(".canvasClass", options.speed_of_effects, {top: 0}, options.delay_of_effects, myCompleteAll ) );

                                    function myCompleteAll() {
                                        setTimeout(obj.all_done, options.slide_animation);
                                    }

                                },
                                change_slide : function change_slide(next_slide) {

                                    $('canvas').remove();

                                    var next_slide = next_slide;

                                    obj.loop(next_slide);

                                    obj.animation();

                                },
                                all_done : function all_done() {

                                    obj.slides.css({
                                        'zIndex': 1,
                                        'display': 'block'
                                    });

                                    var current_slide = $(that).find('li.active');

                                    if (current_slide.length == 0) {
                                        current_slide = obj.start_clip_slide();
                                    }

                                    current_slide.css({
                                        'zIndex': 2,
                                        'display': 'block'
                                    }).find('img').css('visibility','visible');

                                    var next_slide = current_slide.next();

                                    if (next_slide.length == 0) {

                                        current_slide.css({
                                            'zIndex': 2,
                                            'display': 'block'
                                        }).find('img').css('visibility','visible');

                                        next_slide = obj.first_slide();
                                    }

                                    obj.slides.removeClass('active');
                                    next_slide.addClass('active');

                                    next_slide.css({
                                        'zIndex': 3,
                                        'display': 'block'
                                    }).find('img').css('visibility','hidden');

                                    obj.change_slide(next_slide);

                                },
                                init : function () {

                                    obj.first_slide().css({
                                        'zIndex': 1,
                                        'display': 'block'
                                    }).find('img').css('visibility','visible');

                                    obj.start_clip_slide().find('img').css('visibility','hidden');

                                    setTimeout(obj.animation, defaults.start_timeout);
                                }
                            };

                            obj.init();

                        });

                    };

                    $(document).ready(function() {
                        $('#banner').slider();
                    });

                })(jQuery, window, document);

            }
            //build : login
            if(no_panel.includes(2)){
                $('#Account').html(string.content.login)
                $('#Get_age').datepicker({
                    dateFormat : 'yy-mm-dd',
                    showAnim: 'slideDown',
                   changeMonth: true,
                   changeYear: true
                });

            }

            if(no_panel.includes(4)){
                let graph_data = await ServerData.bindAuth({ 'method' : 'POST', 'link' : `php/index.php`, 'header' : true, 'body' : { 'graph' : true, 'table' : 'records' }, 'data' : 'json' })
                $('#Logistics').html(string.content.graph)
                if(graph_data)
                    createGraph({ 'graph_data' : graph_data, 'id' : 'graph', 'text' : "Number Of Records To Dates"})
                else
                    ServerData.pausePage({ 'msg' : 'Request Timeout. Try Again', 'run' : true, 'timer' : 'fast', 'confirm' : false })
            }
            if(no_panel.includes(5)){
                if(login.user){
                    if(sessionStorage.getItem('user') == "true"){
                        $('#build').html(string.account.admin.body)
                        retrieveContent(2,0,0)
                    }else{
                        $('#build').html(string.account.user.body)
                        retrieveContent(1,0,0)
                    }
                    document.getElementById('title').innerHTML = login.name
                }else
                    window.location.assign('index.html')
            }
        }else
            ServerData.pausePage({ 'msg' : 'Request Timeout. Try Again', 'run' : true, 'timer' : 'fast', 'confirm' : false })
    }else
        ServerData.pausePage({ 'msg' : 'Request Timeout. Try Again', 'run' : true, 'timer' : 'fast', 'confirm' : false })
}

