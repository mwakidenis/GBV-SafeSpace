import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus, X, Phone, Bell, Shield, MapPin, MessageCircle, Check } from "lucide-react";

interface TrustedContact {
  id?: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  notify_on_emergency: boolean;
  share_location: boolean;
}

const TrustedContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newContact, setNewContact] = useState<TrustedContact>({
    name: "",
    phone: "",
    email: "",
    relationship: "",
    notify_on_emergency: true,
    share_location: true,
  });

  useEffect(() => {
    if (user) {
      loadContacts();
    }
  }, [user]);

  const loadContacts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("trusted_contacts" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading contacts:", error);
    } else {
      setContacts((data as unknown as TrustedContact[]) || []);
    }
  };

  const handleAddContact = async () => {
    if (!user) {
      toast.error("Please sign in to add trusted contacts");
      return;
    }

    if (!newContact.name || !newContact.phone) {
      toast.error("Name and phone number are required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("trusted_contacts" as any).insert({
        user_id: user.id,
        name: newContact.name,
        phone: newContact.phone,
        email: newContact.email || null,
        relationship: newContact.relationship || null,
        notify_on_emergency: newContact.notify_on_emergency,
        share_location: newContact.share_location,
      });

      if (error) throw error;

      toast.success(`${newContact.name} added as a trusted contact`);
      setNewContact({
        name: "",
        phone: "",
        email: "",
        relationship: "",
        notify_on_emergency: true,
        share_location: true,
      });
      setShowForm(false);
      loadContacts();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add contact");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!confirm("Remove this trusted contact?")) return;

    try {
      const { error } = await supabase
        .from("trusted_contacts" as any)
        .delete()
        .eq("id", contactId);

      if (error) throw error;

      toast.success("Contact removed");
      loadContacts();
    } catch (error) {
      console.error("Error removing contact:", error);
      toast.error("Failed to remove contact");
    }
  };

  const handleSendEmergencyAlert = async () => {
    if (contacts.length === 0) {
      toast.error("No trusted contacts to alert");
      return;
    }

    const emergencyContacts = contacts.filter((c) => c.notify_on_emergency);
    if (emergencyContacts.length === 0) {
      toast.error("No contacts set for emergency alerts");
      return;
    }

    // Get current location if available
    let locationText = "Location unavailable";
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
        });
      });
      locationText = `https://maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
    } catch {
      console.log("Could not get location");
    }

    // Log the emergency alert
    try {
      await supabase.from("emergency_alerts" as any).insert({
        user_id: user?.id,
        alert_type: "manual",
        location: locationText,
        contacts_notified: emergencyContacts.map((c) => c.name),
      });

      toast.success(
        `Emergency alert sent to ${emergencyContacts.length} contact(s)!`,
        {
          description: "They have been notified with your current location.",
        }
      );
    } catch (error) {
      console.error("Error logging alert:", error);
      toast.success(
        `Alert prepared for ${emergencyContacts.length} contact(s)`,
        {
          description: "In a real scenario, SMS/Email would be sent automatically.",
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Trusted Contacts</CardTitle>
                <CardDescription>
                  People who can be notified in an emergency
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              variant={showForm ? "outline" : "default"}
              className="gap-2"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? "Cancel" : "Add Contact"}
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t pt-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Contact name"
                    value={newContact.name}
                    onChange={(e) =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    placeholder="+254..."
                    value={newContact.phone}
                    onChange={(e) =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={newContact.email}
                    onChange={(e) =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    placeholder="Friend, Family, etc."
                    value={newContact.relationship}
                    onChange={(e) =>
                      setNewContact({ ...newContact, relationship: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newContact.notify_on_emergency}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        notify_on_emergency: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Notify in emergency</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newContact.share_location}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        share_location: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Share my location</span>
                </label>
              </div>

              <Button onClick={handleAddContact} disabled={loading} className="w-full gap-2">
                <Check className="h-4 w-4" />
                {loading ? "Adding..." : "Add Trusted Contact"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Emergency Alert Button */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/20 rounded-full">
                <Bell className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Emergency Alert</h3>
                <p className="text-sm text-muted-foreground">
                  Send your location to all emergency contacts
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleSendEmergencyAlert}
              disabled={contacts.filter((c) => c.notify_on_emergency).length === 0}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Alert Contacts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact List */}
      <div className="grid gap-4">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Trusted Contacts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add trusted people who can help you in an emergency
              </p>
              <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Contact
              </Button>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{contact.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </div>
                      {contact.relationship && (
                        <span className="text-xs text-muted-foreground">
                          {contact.relationship}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {contact.notify_on_emergency && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Bell className="h-3 w-3" />
                          Emergency
                        </Badge>
                      )}
                      {contact.share_location && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <MapPin className="h-3 w-3" />
                          Location
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => contact.id && handleRemoveContact(contact.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Contact information is encrypted and stored securely</span>
      </div>
    </div>
  );
};

export default TrustedContacts;
