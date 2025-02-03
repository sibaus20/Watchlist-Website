import { movie } from "./movie";

export interface User {
   _id : String,
   userName : String,
   password : String,
   admin : boolean,
   disabled : boolean,
   want : movie[],
   watched : movie[]
}
