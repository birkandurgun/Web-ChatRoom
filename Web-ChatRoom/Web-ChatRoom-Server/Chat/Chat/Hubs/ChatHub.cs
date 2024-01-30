using Microsoft.AspNetCore.SignalR;

namespace Chat.Hubs
{
    public class ChatHub : Hub
    {

        private static Dictionary<string, string> connectedClients = new Dictionary<string, string>();

        public async Task SendMessage(string username,string message)
        {
            await Clients.All.SendAsync("ReceiveMessage",username, message);
        }

        public async Task JoinChat(string username, string message)
        {
            connectedClients[Context.ConnectionId] = username;
            await Clients.Others.SendAsync("ReceiveMessage",username,message);
        }

        public async Task onDisconnected()
        {
            if(connectedClients.TryGetValue(Context.ConnectionId, out string username))
            {
                var message = $"{username} left";
                await Clients.Others.SendAsync("ReceiveMessage", username, message);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await onDisconnected();
            await base.OnDisconnectedAsync(exception);
        }

    }
}
