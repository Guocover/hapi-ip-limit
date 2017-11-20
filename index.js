/**
 * set route-level cors 
 * @author coverguo
 */

'use strict';

var Boom = require('boom');
//GLOBAL _ IP _LIST
var GLOBAL_IP_LIMIT = {
    reject: [],
    allow: []
};

function getClientIp(request) {
    if (request && (request.headers || request.info)) {
        return request.headers['x-forwarded-for'] || request.info.remoteAddress || 'unknow';
    } else {
        return 'unknow';
    }
}



exports.register = function(server, options, next) {
    GLOBAL_IP_LIMIT = {
        reject: options.reject || [],
        allow: options.allow || []
    };

    server.ext('onPreHandler', function(request, reply) {

        var settings = request.route.settings;
        var routeIpLimit = settings.plugins && settings.plugins['ip-limit'];
        var error, rejectList;
        var clientIp = getClientIp(request);
        // console.log('++++clientIp++++', clientIp);


        if (clientIp === 'unknow') {
            return reply.continue();
        }

        if (routeIpLimit && routeIpLimit.reject) {
            error = null;
            rejectList = routeIpLimit.reject;
            rejectList.forEach(function(rejectIp) {
                if (rejectIp === clientIp) {
                    console.log('reject', rejectIp);

                    error = Boom.badRequest('ip limit exceeded');
                    error.output.statusCode = 404; // Assign a Too Many Requests response
                    error.reformat();
                    return reply(error);
                }
            });
            return reply.continue();
        } else if (GLOBAL_IP_LIMIT.reject) {

            error = null;
            rejectList = GLOBAL_IP_LIMIT.reject;
            rejectList.forEach(function(rejectIp) {
                if (rejectIp === clientIp) {
                    console.log('reject', rejectIp);
                    error = Boom.badRequest('ip limit exceeded');
                    error.output.statusCode = 404; // Assign a Too Many Requests response
                    error.reformat();
                    return reply(error);
                }
            });
            return reply.continue();

        } else {
            return reply.continue();
        }




    });


    next();
};



exports.register.attributes = {
    pkg: require('./package.json')
};
