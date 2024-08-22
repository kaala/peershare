var ps = {}

document.body.onload = function () {
    var peers = document.querySelector('div#peers')
    var dataset = document.querySelector('div#dataset')


    ps.conf = {
        config: {
            'iceServers': [
                { url: 'stun:stun.miwifi.com:3478' },
                // { url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo' }
            ]
        },
        debug: 3,
    }

    ps.print = function (dom, args) {
        var html = args.join(' ')
        var node = document.createElement('p')
        node.innerHTML = html
        dom.appendChild(node)
    }

    ps.host = function () {
        var peer = new Peer(ps.conf)

        peer.on('open', function (id) {
            ps.me = peer
            ps.peers = {}
            ps.print(peers, [id, peer.label, '(me)'])
            ps.print(dataset, ['room link', `<a href=?roomid=${id} target="_blank">${id}</a>`])
        })

        peer.on('connection', function (conn) {
            ps.peers[conn.label] = conn
        });
    }

    ps.connect = function (roomid) {
        var peer = new Peer(ps.conf);

        peer.on('open', function (id) {
            ps.me = peer
            ps.peers = {}
            ps.print(peers, [id, 'me'])

            var conn = peer.connect(roomid)
        })
    }

    var search = document.location.search
    var roomid = search.match(/roomid=(\w+)/g)
    if (roomid) {
        console.log(roomid)
        ps.connect(roomid)
    } else {
        ps.host()
    }
}