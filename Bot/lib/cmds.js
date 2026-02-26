const requireAuth = ['listen', 'drop', 'mate', 'divorce', 'crsh']
function listen(bdg, orig, cid, args) {
    if (orig == 'Fluxer') {
        args.map((id) => {
            bdg.Discord[id] = (bdg.Discord[id])? bdg.Discord[id] : [];
            if (!bdg.Discord[id].includes(cid)) {bdg.Discord[id].push(cid)}
        })
    }
    if (orig == 'Discord') {
        args.map((id) => {
            bdg.Fluxer[id] = (bdg.Fluxer[id])? bdg.Fluxer[id] : [];
            if (!bdg.Fluxer[id].includes(cid)) {bdg.Fluxer[id].push(cid)}
        })
    }
    return bdg;
}

function drop(bdg, orig, cid, args) {
    if (orig == 'Fluxer') {
        args.map((id) => {
            if (bdg.Discord[id] && bdg.Discord[id].includes(cid)) {
                bdg.Discord[id].splice(bdg.Discord[id].indexOf(cid), 1);
                if (bdg.Discord[id].length == 0) {delete bdg.Discord[id]}
            }
        })
    }
    if (orig == 'Discord') {
        args.map((id) => {
            if (bdg.Fluxer[id] && bdg.Fluxer[id].includes(cid)) {
                bdg.Fluxer[id].splice(bdg.Fluxer[id].indexOf(cid), 1);
                if (bdg.Fluxer[id].length == 0) {delete bdg.Fluxer[id]}
            }
        })
    }
    return bdg;
}

function mate(bdg, orig, cid, args) {
    if (orig == 'Fluxer') {
        bdg = listen(bdg, 'Fluxer', cid, [args[0]]);
        bdg = listen(bdg, 'Discord', args[0], [cid]);
    }
    if (orig == 'Discord') {
        bdg = listen(bdg, 'Discord', cid, [args[0]]);
        bdg = listen(bdg, 'Fluxer', args[0], [cid]);
    }
    return bdg;
}

function divorce(bdg, orig, cid, args) {
    if (orig == 'Fluxer') {
        bdg = drop(bdg, 'Fluxer', cid, [args[0]]);
        bdg = drop(bdg, 'Discord', args[0], [cid]);
    }
    if (orig == 'Discord') {
        bdg = drop(bdg, 'Discord', cid, [args[0]]);
        bdg = drop(bdg, 'Fluxer', args[0], [cid]);
    }
    return bdg;
}

function help() {
    return "### [PRFX] listen [Channel ID 1], [Channel ID 2], [Channel ID 3]...\n" +
    "Subscribe the channel this is sent in to a list of channels\n" +
    "### [PRFX] drop [Channel ID 1], [Channel ID 2], [Channel ID 3]...\n" +
    "Unsubscribe the channel this is sent in from a list of channels\n" +
    "### [PRFX] mate [Channel ID]\n" +
    "Link the channel this is sent in with another channel\n" +
    "### [PRFX] divorce [Channel ID]\n" +
    "Unlink another channel and the channel this is sent in"
}

export function parse(auth, bdg, orig, cid, msg) {
    let res;
    let cmd = msg.match(/[^"\s]+|"[^"]+"/g).map((i) => {return i.replaceAll('"', "")})
    if (requireAuth.includes(cmd[0]) && auth == false) {return "This command requires Manage Channels permission."}
    if (cmd[0] == 'listen') {return listen(bdg, orig, cid, cmd.slice(1))}
    if (cmd[0] == 'drop') {return drop(bdg, orig, cid, cmd.slice(1))}
    if (cmd[0] == 'mate') {return mate(bdg, orig, cid, cmd.slice(1))}
    if (cmd[0] == 'divorce') {return divorce(bdg, orig, cid, cmd.slice(1))}
    if (cmd[0] == 'help') {return help()}
    if (cmd[0] == 'crsh') {throw new Error("Crashed. Scary!")}
    return "Unknown command. Use [PRFX] help";
}
