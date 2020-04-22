import { MessageDto, InboxDto, OutgoingPacket, IncomingPacket } from './chat_d';
import { register } from './serviceWorker';

export class EventProducer<M>
{
    private listeners: { type: keyof M, listener, obj?: Object }[] = [];
    addEventListener<K extends keyof M>( type: K, listener: M[K], obj?: Object )
    {
        this.listeners.push( { type, listener, obj } );
    }
    removeEventListener<K extends keyof M>( type: K, listener: M[K] )
    {
        this.listeners.splice( this.listeners.findIndex( x => x.type === type && x.listener === listener ), 1 );
    }

    protected dispatch<K extends keyof M>( type: K, ...args )
    {
        for ( let listener of this.listeners.filter( x => x.type === type ) )
           listener.listener.call( listener.obj, ...args );
    }

    removeAllEventListener( obj: Object )
    {
        if ( !obj )
            throw new Error( "Must specify object" );
        this.listeners = this.listeners.filter( x => x.obj !== obj );
    }


}

interface ProxyEventMap
{
    "login": () => void;
    "message": ( channelId: string, message: MessageDto ) => void;
    "conversation": ( channelId: string ) => void;
}

class Proxy extends EventProducer<ProxyEventMap>
{
    private ws: WebSocket;
    constructor()
    {
        super();
        this.ws = new WebSocket( "wss://raja.aut.bme.hu/chat/" );
        this.ws.addEventListener( "open", () =>
        {
            //this.ws.send( "Hello" );
            //this.register();
        } );
        this.ws.addEventListener( "message", e =>
        {
            //alert(e.data);
            let p = <IncomingPacket>JSON.parse( e.data );
            switch ( p.type )
            {
                case "error":
                    alert( p.message );
                    break;
                case "login":
                    this.inbox = p.inbox;
                    this.dispatch( "login" );
                    break;
                case "message":
                    let cid = p.channelId;
                    this.inbox!.conversations.find( x => x.channelId === cid )?.lastMessages.push( p.message );
                    this.dispatch( "message", cid, p.message );
                    break;
                case "conversationAdded":
                    this.inbox!.conversations.push( p.conversation );
                    this.dispatch( "conversation", p.conversation.channelId );
                    break;
            }
        } );
    }

    sendPacket( packet: OutgoingPacket )
    {
        this.ws.send(JSON.stringify( packet ) );
    }

    inbox: InboxDto | null = null;

    register() {
        proxy.sendPacket({ type: "register", email: "CX55PP", password: "320a5b99", displayName: "cx55pp", staySignedIn: true });
        //CX55PP_2, teszt, teszt
    }
}
export var proxy = new Proxy();