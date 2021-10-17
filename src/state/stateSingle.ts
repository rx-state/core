import { Observable } from "rxjs"
import shareLatest from "@/internal/share-latest"

export default function state<T>(observable: Observable<T>, defaultValue: T) {
  return shareLatest<T>(observable, defaultValue)
}
