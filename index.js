var express = require('express'),
    fs = require('fs'),
    sys_monitor = require('./sys_monitor'),
    config = require('./config/config'),
    app = express();

sys_monitor.run(5000);

app.get('/', function (req, res, next) {
    var file = fs.readFileSync(config.PATH.data+'/sysinfo.json'),
        data = JSON.parse(file),
        response = {
            message: {memory: '', cpu: ''},
            process_count: data.process.count,
            cpu_utilization: data.cpu.usage * 100,
            memory_usage: data.memory.use,
            max_memory_usage: data.memory.max,
            uptime: data.uptime
        };

    res.send(response);
});


app.listen(config.PORT, function () {
    console.log('listening at port ' + config.PORT);
});
