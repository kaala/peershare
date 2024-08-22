var ps = {};

document.body.onload = function () {
    var dom = {
        info: document.querySelector('p#info'),
        peers: document.querySelector('p#peers'),
        contents: document.querySelector('p#contents'),
    };

    dom.peers.onclick = function (ev) {
        console.log('!!! click', ev.target, ev);

        var node = ev.target;
        var peer = node.innerHTML;
        var msg = prompt(`send to ${peer}`);
        if (msg) {
            ps.sendmsg(peer, msg);
        }
    };


    ps.print = function (dom, args) {
        var html = args.map(function (e) { return `${e}`; }).join(' ');
        var node = document.createElement('section');
        node.innerHTML = html;
        dom.appendChild(node);
    };

    ps.update = function (type) {
        if (type === 'peers') {
            var peer = ps.me;
            var doms = Array.from(dom.peers.childNodes);
            var connections = Object.keys(peer.connections);
            doms.forEach(function (e) {
                dom.peers.removeChild(e);
            });
            connections.forEach(function (e) {
                ps.print(dom.peers, [e]);
            });
        }
    };


    ps.sendmsg = function (id, data) {
        var peer = ps.me;
        var maps = peer.connections;
        var conn = maps[id];
        conn.forEach(pc => {
            pc.send(['text', data]);
        });
    };
    ps.sendfile = function (id, data) {
        var peer = ps.me;
        var maps = peer.connections;
        var conn = maps[id];
        conn.forEach(pc => {
            pc.send(['blob', data]);
        });
    };
    ps.publish = function (pub, data) {
        var peer = ps.me;
        var maps = peer.connections;
        var conn = Object.values(maps).flat();
        conn.forEach(pc => {
            pc.send([pub, data]);
        });
    };

    ps.sub = function (conn) {
        conn.on('open', function () {
            ps.update('peers');
        });
        conn.on('close', function () {
            ps.update('peers');
        });
        conn.on('data', function (data) {
            console.log('!!! conn.data', this, arguments);
            var peer = this;
            ps.print(dom.contents, [peer.peer, `<code>${data}</code>`]);
        });
    };

    ps.connect = function (peer, roomid) {

        peer.on('open', function (id) {
            ps.print(dom.info, ['me', id]);

            if (roomid) {
                var conn = peer.connect(roomid, { reliable: true });
                ps.sub(conn);
            } else {
                ps.print(dom.info, ['roomid', `<a href=?roomid=${id} target="_blank">${id}</a>`]);
            }
        });

        peer.on('connection', function (conn) {
            ps.sub(conn);
            ps.publish('peers', { peer: conn.peer });
        });
        peer.on('disconnected', function () {
            this.reconnect();
        });
    };

    ps.conf = { debug: 3, };

    var search = document.location.search;
    var room = search.match(/roomid=(?<roomid>.+)/);
    var roomid = false;
    if (room) {
        roomid = room[1];
    }

    var host = new Peer(ps.conf);
    ps.connect(host, roomid);

    ps.me = host;
    ps.peers = {};
};
