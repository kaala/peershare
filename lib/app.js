var ps = {}

document.body.onload = function () {
    var dom = {
        info: document.querySelector('p#info'),
        peers: document.querySelector('p#peers'),
        contents: document.querySelector('p#contents'),
    }

    ps.print = function (ctx, args) {
        var node = document.createElement('section')
        node.innerHTML = args.join('; ')
        ctx.appendChild(node)
    }


    ps.sendmsg = function (id, data) {
        var host = ps.host
        var maps = host.connections
        var conn = maps[id]
        conn.forEach(pc => {
            pc.send(['text', data])
        })
    }
    ps.sendfile = function (id, data) {
        var host = ps.host
        var maps = host.connections
        var conn = maps[id]
        conn.forEach(pc => {
            pc.send(['blob', data])
        })
    }
    ps.publish = function (pub, data) {
        var host = ps.host
        var maps = host.connections
        var conn = Object.values(maps).flat()
        conn.forEach(pc => {
            pc.send([pub, data])
        })
    }


    function onmessage(peer, data) {
        var cmd = data.shift()

        if (cmd === 'text') {
            ps.print(dom.contents, [peer.peer, `<code>${data}</code>`])
        }

        if (cmd === 'blob') {
            var blob = new Blob(data)
            var url = URL.createObjectURL(blob)
            ps.print(dom.contents, [peer.peer, `<a href="${url}" download>${url}</a>`])
        }

        if (cmd === 'update') {
            var host = ps.host
            var element = Array.from(dom.peers.childNodes)
            var connect = Object.keys(host.connections)
            element.forEach(function (e) {
                dom.peers.removeChild(e)
            })
            connect.forEach(function (e) {
                ps.print(dom.peers, [`<a data-id="${e}">${e}</a>`])
            })
        }

        if (cmd === 'peer') {
            var host = ps.host
            if (host.id !== peer) {
                console.log('!!!', `connect to ${peer}`)
            }
        }
    }

    function onconnect(conn) {
        conn.on('open', function () {
            var peer = this
            onmessage(peer, ['update'])
        })
        conn.on('close', function () {
            var peer = this
            onmessage(peer, ['update'])
        })
        conn.on('data', function (data) {
            var peer = this
            onmessage(peer, data)
        })
    };

    ps.connect = function (roomid) {
        var host = ps.host

        host.on('open', function (id) {
            ps.print(dom.info, ['me', id])

            if (roomid) {
                var conn = host.connect(roomid, { reliable: true })
                onconnect(conn)
            } else {
                ps.print(dom.info, ['roomid', `<a href=?roomid=${id} target="_blank">${id}</a>`])
            }
        })

        host.on('connection', function (conn) {
            onconnect(conn)
            ps.publish('peers', [conn.peer])
        })
        host.on('disconnected', function () {
            this.reconnect()
        })
    }


    dom.peers.onclick = function (ev) {
        console.log('!!! click', ev.target, ev)
        var node = ev.target
        var peer = node.dataset['id']
        var msg = prompt(`to ${peer}`)
        if (msg) {
            ps.sendmsg(peer, msg)
        }
    }
    dom.contents.onclick = function (ev) {
        console.log('!!! click', ev.target, ev)
        var node = ev.target
        navigator.clipboard.writeText(node.innerHTML)
    }


    setTimeout(() => {
        var search = document.location.search
        var room = search.match(/roomid=(?<roomid>.+)/)
        var roomid = false
        if (room) {
            roomid = room[1]
        }

        ps.conf = { debug: 2, }
        var host = new Peer(ps.conf)
        ps.host = host
        ps.peers = {}

        ps.connect(roomid)
    })

}
