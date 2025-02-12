export interface movie{
    title: string,
    released: string,
    description: string,
    watchDate: Date,//IF NULL MEANS WANT TO WATCH, IF VAL MEANS WATCHED
    ownerID: string,
    posterUrl: string,
}