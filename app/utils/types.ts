export type channel = {
    number: number,
    name: string,
    order: number,
    hidden: boolean,
    color: string,
}

export type channelGroup = {
    name: string,
    order: number,
    hidden: boolean,
    channels: channel[],
}

export type aux = {
    number: number,
    order: number,
    name: string,
    hidden: boolean,
    stereo: boolean,
    color: string,
}
