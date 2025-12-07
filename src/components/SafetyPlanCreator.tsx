import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, X, Save, Phone, MapPin, Users, AlertTriangle, Heart } from "lucide-react";

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface SafePlace {
  name: string;
  address: string;
  notes: string;
}

interface SafetyPlan {
  id?: string;
  title: string;
  emergency_contacts: EmergencyContact[];
  safe_places: SafePlace[];
  warning_signs: string;
  coping_strategies: string;
  support_network: string[];
  important_documents: string;
}

const SafetyPlanCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<SafetyPlan>({
    title: "My Safety Plan",
    emergency_contacts: [{ name: "", phone: "", relationship: "" }],
    safe_places: [{ name: "", address: "", notes: "" }],
    warning_signs: "",
    coping_strategies: "",
    support_network: [""],
    important_documents: "",
  });

  useEffect(() => {
    if (user) {
      loadExistingPlan();
    }
  }, [user]);

  const loadExistingPlan = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("safety_plans")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setPlan({
        id: data.id,
        title: data.title,
        emergency_contacts: (data.emergency_contacts as unknown as EmergencyContact[]) || [],
        safe_places: (data.safe_places as unknown as SafePlace[]) || [],
        warning_signs: data.warning_signs || "",
        coping_strategies: data.coping_strategies || "",
        support_network: (data.support_network as unknown as string[]) || [],
        important_documents: data.important_documents || "",
      });
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please sign in to save your safety plan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const planData = {
        user_id: user.id,
        title: plan.title,
        emergency_contacts: plan.emergency_contacts as unknown as null,
        safe_places: plan.safe_places as unknown as null,
        warning_signs: plan.warning_signs,
        coping_strategies: plan.coping_strategies,
        support_network: plan.support_network as unknown as null,
        important_documents: plan.important_documents,
      };

      if (plan.id) {
        const { error } = await supabase
          .from("safety_plans")
          .update(planData)
          .eq("id", plan.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("safety_plans").insert(planData);
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Safety plan saved securely",
      });
      loadExistingPlan();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save safety plan";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEmergencyContact = () => {
    setPlan({
      ...plan,
      emergency_contacts: [...plan.emergency_contacts, { name: "", phone: "", relationship: "" }],
    });
  };

  const removeEmergencyContact = (index: number) => {
    const contacts = [...plan.emergency_contacts];
    contacts.splice(index, 1);
    setPlan({ ...plan, emergency_contacts: contacts });
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const contacts = [...plan.emergency_contacts];
    contacts[index][field] = value;
    setPlan({ ...plan, emergency_contacts: contacts });
  };

  const addSafePlace = () => {
    setPlan({
      ...plan,
      safe_places: [...plan.safe_places, { name: "", address: "", notes: "" }],
    });
  };

  const removeSafePlace = (index: number) => {
    const places = [...plan.safe_places];
    places.splice(index, 1);
    setPlan({ ...plan, safe_places: places });
  };

  const updateSafePlace = (index: number, field: keyof SafePlace, value: string) => {
    const places = [...plan.safe_places];
    places[index][field] = value;
    setPlan({ ...plan, safe_places: places });
  };

  const addSupportPerson = () => {
    setPlan({ ...plan, support_network: [...plan.support_network, ""] });
  };

  const updateSupportPerson = (index: number, value: string) => {
    const network = [...plan.support_network];
    network[index] = value;
    setPlan({ ...plan, support_network: network });
  };

  const removeSupportPerson = (index: number) => {
    const network = [...plan.support_network];
    network.splice(index, 1);
    setPlan({ ...plan, support_network: network });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Personal Safety Plan</CardTitle>
              <CardDescription>
                Create a confidential safety plan to help you during difficult times
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="title">Plan Title</Label>
          <Input
            id="title"
            value={plan.title}
            onChange={(e) => setPlan({ ...plan, title: e.target.value })}
            placeholder="My Safety Plan"
          />
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-lg">Emergency Contacts</CardTitle>
              <CardDescription>People you can call in an emergency</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.emergency_contacts.map((contact, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Contact {index + 1}</span>
                {plan.emergency_contacts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEmergencyContact(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={contact.name}
                    onChange={(e) => updateEmergencyContact(index, "name", e.target.value)}
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={contact.phone}
                    onChange={(e) => updateEmergencyContact(index, "phone", e.target.value)}
                    placeholder="+254..."
                  />
                </div>
                <div>
                  <Label>Relationship</Label>
                  <Input
                    value={contact.relationship}
                    onChange={(e) => updateEmergencyContact(index, "relationship", e.target.value)}
                    placeholder="Friend, Family, etc."
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addEmergencyContact} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Another Contact
          </Button>
        </CardContent>
      </Card>

      {/* Safe Places */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-green-600" />
            <div>
              <CardTitle className="text-lg">Safe Places</CardTitle>
              <CardDescription>Places you can go if you need to leave quickly</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan.safe_places.map((place, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Place {index + 1}</span>
                {plan.safe_places.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeSafePlace(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Place Name</Label>
                  <Input
                    value={place.name}
                    onChange={(e) => updateSafePlace(index, "name", e.target.value)}
                    placeholder="Friend's house, shelter, etc."
                  />
                </div>
                <div>
                  <Label>Address/Location</Label>
                  <Input
                    value={place.address}
                    onChange={(e) => updateSafePlace(index, "address", e.target.value)}
                    placeholder="Address or landmark"
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={place.notes}
                  onChange={(e) => updateSafePlace(index, "notes", e.target.value)}
                  placeholder="How to get there, contact person, etc."
                />
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addSafePlace} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Another Place
          </Button>
        </CardContent>
      </Card>

      {/* Warning Signs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <CardTitle className="text-lg">Warning Signs</CardTitle>
              <CardDescription>Signs that indicate you may need to use your safety plan</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={plan.warning_signs}
            onChange={(e) => setPlan({ ...plan, warning_signs: e.target.value })}
            placeholder="List the warning signs you've noticed before dangerous situations..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Coping Strategies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-pink-600" />
            <div>
              <CardTitle className="text-lg">Coping Strategies</CardTitle>
              <CardDescription>Things that help you feel calm and safe</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={plan.coping_strategies}
            onChange={(e) => setPlan({ ...plan, coping_strategies: e.target.value })}
            placeholder="Deep breathing, calling a friend, going for a walk, listening to music..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Support Network */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">Support Network</CardTitle>
              <CardDescription>People who support and believe you</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {plan.support_network.map((person, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={person}
                onChange={(e) => updateSupportPerson(index, e.target.value)}
                placeholder="Name of person who supports you"
              />
              {plan.support_network.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeSupportPerson(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" onClick={addSupportPerson} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Another Person
          </Button>
        </CardContent>
      </Card>

      {/* Important Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Important Documents</CardTitle>
          <CardDescription>List of important documents and where they are kept</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={plan.important_documents}
            onChange={(e) => setPlan({ ...plan, important_documents: e.target.value })}
            placeholder="ID cards, passport, birth certificates, bank details, important phone numbers..."
            rows={4}
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="w-full gap-2" size="lg">
        <Save className="h-5 w-5" />
        {loading ? "Saving..." : "Save Safety Plan"}
      </Button>
    </div>
  );
};

export default SafetyPlanCreator;
