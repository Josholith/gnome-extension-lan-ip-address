import Gio from 'gi://Gio';

export const getLanIp = async () => {
    return new Promise((resolve, reject) => {
        // Ask the IP stack what route would be used to reach 1.1.1.1 (Cloudflare DNS)
        // Specifically, what src would be used for the 1st hop?
        const proc = Gio.Subprocess.new(
            ['ip', 'route', 'get', '1.1.1.1'],
            Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
        )

        proc.init(null);

        proc.communicate_utf8_async(
            null, // No input to send
            null, // Not cancellable
            (self, res) => {
                // Finish and get [ok, stdout, stderr]
                let [ok, stdout, stderr] = self.communicate_utf8_finish(res);
                if (!ok) {
                    return reject('Subprocess communicate failed');
                }
                if (stderr.length > 0)
                    return reject(stderr);

                const srcIpAddress = _extractSrcIpAddress(stdout);
                resolve(srcIpAddress);
            }
        );
    });
}

const _extractSrcIpAddress = (command_output_string) => {
    // Output of the "ip route" command will be a string
    // " ... src 1.2.3.4 ..."
    // So basically we want the next token (word) immediately after the "src"
    // word, and nothing else. This is considered our LAN IP address.
    const Re = new RegExp(/src [^ ]+/g);
    const matches = command_output_string.match(Re);
    if (matches) {
        return matches[0].split(' ')[1];
    } else {
        return '';
    }
}

