import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FileIcon, ImageIcon } from "lucide-react";

const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [resolutionDate, setResolutionDate] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `http://localhost:5000/api/tickets/${id}`,
          config
        );
        setTicket(data);
        setStatus(data.status);
        setPriority(data.priority);
        if (data.resolutionDate) {
          setResolutionDate(
            new Date(data.resolutionDate).toISOString().split("T")[0]
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTicket();
  }, [id, user.token]);

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(
        `http://localhost:5000/api/tickets/${id}/responses`,
        { message: response },
        config
      );
      setResponse("");
      const { data } = await axios.get(
        `http://localhost:5000/api/tickets/${id}`,
        config
      );
      setTicket(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.put(
        `http://localhost:5000/api/tickets/${id}`,
        { status, priority, resolutionDate },
        config
      );
      const { data } = await axios.get(
        `http://localhost:5000/api/tickets/${id}`,
        config
      );
      setTicket(data);
      alert("Ticket updated successfully");
    } catch (error) {
      console.error(error);
    }
  };

  if (!ticket) return <div>Loading...</div>;

  const isSLANearBreach = () => {
    if (
      !ticket.resolutionDate ||
      ticket.status === "Resolved" ||
      ticket.status === "Closed"
    ) {
      return false;
    }
    const now = new Date();
    const slaDate = new Date(ticket.resolutionDate);
    const hoursRemaining = (slaDate - now) / (1000 * 60 * 60);
    return hoursRemaining <= 24 && hoursRemaining > 0;
  };

  const isSLABreached = () => {
    if (
      !ticket.resolutionDate ||
      ticket.status === "Resolved" ||
      ticket.status === "Closed"
    ) {
      return false;
    }
    return new Date() > new Date(ticket.resolutionDate);
  };

  return (
    <Layout>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ticket Details</CardTitle>
                {isSLABreached() && (
                  <Badge className="bg-red-600">SLA BREACHED</Badge>
                )}
                {isSLANearBreach() && !isSLABreached() && (
                  <Badge className="bg-yellow-600">SLA WARNING (24h)</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{ticket.title}</h3>
                <p className="text-sm text-gray-500">ID: {ticket._id}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="mt-1 text-sm">{ticket.description}</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div>
                  <Label>Category</Label>
                  <Badge variant="outline" className="ml-2">
                    {ticket.category}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className="ml-2">{ticket.status}</Badge>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant="outline" className="ml-2">
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Created By</Label>
                <p className="text-sm">
                  {ticket.user.name} ({ticket.user.email})
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Created At</Label>
                  <p className="text-sm">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p className="text-sm">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div>
                  <Label>Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {ticket.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={`http://localhost:5000/${file.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50"
                      >
                        {file.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileIcon className="w-4 h-4" />
                        )}
                        <span className="text-sm">{file.filename}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Controls */}
          {user.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-50">
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-50">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Resolution Date (SLA Deadline)</Label>
                  <Input
                    type="date"
                    value={resolutionDate}
                    onChange={(e) => setResolutionDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdate} className="w-full">
                  Update Ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex-grow space-y-4 mb-4 overflow-y-auto max-h-[500px]">
                {ticket.responses.map((res, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      res.user === user._id
                        ? "bg-blue-50 ml-8"
                        : "bg-gray-100 mr-8"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">
                      {res.user === user._id ? "You" : "Support/User"} -{" "}
                      {new Date(res.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm">{res.message}</p>
                  </div>
                ))}
                {ticket.responses.length === 0 && (
                  <p className="text-center text-gray-500">No messages yet.</p>
                )}
              </div>
              <form onSubmit={handleResponseSubmit} className="space-y-2">
                <Textarea
                  placeholder="Type your response..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Send Response
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetail;
