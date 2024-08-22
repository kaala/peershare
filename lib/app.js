var ps = {}

document.body.onload = function () {
    var peers = document.querySelector('div#peers')
    var dataset = document.querySelector('div#dataset')


    ps.print = function (dom, args) {
        var html = args.join(', ')
        var node = document.createElement('p')
        node.innerHTML = html
        dom.appendChild(node)
    }

    ps.send = function (id, data) {
        var dict = ps.me.connections
        var peer = dict[id]
        peer.forEach(p => {
            p.send(data)
        });
    }

    ps.subscribe = function (conn) {
        conn.on('open', function () {
        })
        conn.on('data', function (data) {
            ps.print(dataset, ['data', `<code>${data}</code>`])
        })
    }

    ps.connect = function (roomid) {

        peer.on('open', function (id) {
            ps.print(peers, [id, 'me'])

            if (roomid) {
                var conn = peer.connect(roomid)
                ps.subscribe(conn)
            } else {
                ps.print(dataset, ['room link', `<a href=?roomid=${id} target="_blank">${id}</a>`])
            }
        })

        peer.on('connection', function (conn) {
            ps.subscribe(conn)
        });
    }


    var search = document.location.search
    var room = search.match(/roomid=(?<roomid>.+)/)
    var roomid = false
    if (room) {
        roomid = room[1]
    }

    ps.conf = { debug: 2, }
    var peer = new Peer(ps.conf)
    ps.me = peer
    ps.connect(roomid)
}