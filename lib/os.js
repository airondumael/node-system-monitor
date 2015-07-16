var os = require('os')
    child_process = require('child_process');

exports.cpus = function () {
    return os.cpus();
}

exports.cpu_free = function (index, callback) {
    get_cpu_usage(index, callback, true);
}

exports.cpu_usage = function (index, callback) {
    get_cpu_usage(index, callback, false);
}


exports.average_cpu_free = function (callback) {
    get_average_cpu_usage(callback, true);
}

exports.average_cpu_usage = function (callback) {
    get_average_cpu_usage(callback, false);
}


exports.get_processes = function (callback) {
    command = 'ps -eo pcpu,pmem,time,args | sort -k 1 -r | grep -v "$CPU $MEM TIME ARGS"'

    child_process.exec(command, function (error, stdout, stderr) {
        var processes = [],
            lines = stdout.split("\n");

        lines.forEach(function (item,i) {
            var str = item.replace( /[\s\n\r]+/g,' ');

            str = str.split(' ')

            if ('undefined' === typeof str[4]) {
                return;
            }

            var process = {
                cpu: str[1],
                mem: str[2],
                time: str[3],
                args: str[4].substring((str[4].length - 25))
            };

            processes.push(process);
        });

        callback(processes);
    });
};

function get_cpu_usage(index, callback, free) {

    var stats1 = get_cpu_information (index);
    var start_idle = stats1.idle;
    var start_total = stats1.total;

    setTimeout(function () {
        var stats2 = get_cpu_information (index);
        var end_idle = stats2.idle;
        var end_total = stats2.total;

        var idle 	= end_idle - start_idle;
        var total 	= end_total - start_total;
        var perc	= idle / total;

        if(free === true) {
            callback(null, perc);
        }
        else
        {
            callback(null, (1 - perc));
        }

    }, 1000 );
}


function get_cpu_information (index, callback) {
    var cpus = os.cpus();

    var user = cpus[index].times.user;
    var nice = cpus[index].times.nice;
    var sys = cpus[index].times.sys;
    var irq = cpus[index].times.irq;
    var idle = cpus[index].times.idle;

    var total = user + nice + sys + idle + irq;

    return {
        'idle': idle,
        'total': total
    };
}


function get_average_cpu_usage(callback, free) {

    var stats1 = get_average_cpu_info();
    var start_idle = stats1.idle;
    var start_total = stats1.total;

    setTimeout(function () {
        var stats2 = get_average_cpu_info();
        var end_idle = stats2.idle;
        var end_total = stats2.total;

        var idle 	= end_idle - start_idle;
        var total 	= end_total - start_total;
        var perc	= idle / total;

        if(free === true) {
            callback(null, perc);
        }
        else {
            callback(null, (1 - perc));
        }

    }, 1000 );
}

function get_average_cpu_info(callback) {
    var cpus = os.cpus();

    var user = 0;
    var nice = 0;
    var sys = 0;
    var idle = 0;
    var irq = 0;
    var total = 0;

    for(var cpu in cpus) {
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;
    }

    var total = user + nice + sys + idle + irq;

    return {
        'idle': idle,
        'total': total
    };
}

exports.uptime = function () {
    return os.uptime();
}

exports.usemem = function () {
    return (os.totalmem() - os.freemem()) / ( 1024 * 1024 );
}

exports.freemem = function () {
    return os.freemem() / (1024 * 1024);
}

exports.totalmem = function () {
    return os.totalmem() / (1024 * 1024);
}

exports.freemem_percentage = function () {
    return os.freemem() / _os.totalmem();
}

