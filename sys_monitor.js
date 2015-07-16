var os = require('./lib/os'),
    fs = require('fs'),
    _ = require('lodash'),
    async = require('async'),

    config = require('./config/config'),

    data_path = config.PATH.data + '/data.json',

    get_sys_info = function (callback) {
        async.parallel({
                cpu: get_cpus_info,
                memory: get_memory_info,
                uptime: get_uptime,
                process: get_processes
            }, callback);
    },

    get_cpu_info = function (callback) {
        var cpus = _.extend(os.cpus()),
            jobs = [];

        _.each(cpus, function (cpu, index) {
            jobs.push(function (cb) {
                async.parallel({
                    usage: os.cpu_usage.bind(null, index),
                    free: os.cpu_free.bind(null, index)
                }, function (err, result) {
                    cb(err, result);
                });
            });
        });

        async.parallel(jobs, function (err, result) {
            callback(err, result);
        });
    },

    get_cpus_info = function (callback) {
        async.parallel({
            cpus: get_cpu_info,
            usage: os.average_cpu_usage,
            free: os.average_cpu_free,
        }, callback);
    },

    get_memory_info = function (callback) {
        var memory = {
            use: os.usemem(),
            free: os.freemem(),
            total: os.totalmem(),
            max: 0
        };


        fs.exists(data_path, function (exist) {
            var file = fs.readFileSync(data_path),
                data = JSON.parse(file);

            memory.max = data.max_memory;
        });

        callback(null, memory);
    },

    get_uptime = function (callback) {
        callback(null, os.uptime());
    },

    get_processes = function (callback) {
        var process = {};

        os.get_processes(function (processes) {
            process.count = processes.length;
            process.processes = processes;

            callback(null, process);
        });
    },

    update_max_memory = function (data) {

        fs.exists(data_path, function (exist) {
            var max_memory = 0,
                memory = data.memory.use;

            if (exist) {
                var old_data = JSON.parse(fs.readFileSync(data_path));

                max_memory = old_data.max_memory;
            }

            if (memory > max_memory) {

                fs.writeFile(
                    data_path,
                    JSON.stringify({max_memory: data.memory.use}, null, '\t'),
                    'utf-8');
            }
        });

    },

    update_sys_info = function (data) {
        var sys_info_path = config.PATH.data + '/sysinfo.json';

        fs.writeFile(sys_info_path, JSON.stringify(data, null, '\t'), 'utf-8');
    },

    run = function (interval) {
        var interval = interval && interval > 1000 ? interval : 1000;

        get_sys_info(function (err, result) {
            update_max_memory(result);
            update_sys_info(result);

            setTimeout(function () {
                run();
            }, interval);
        });
    };

exports.run = run;
